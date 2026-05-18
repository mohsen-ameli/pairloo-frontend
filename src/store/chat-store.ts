import { atom } from "jotai"
import { logOutAtom, userAtom, userSecureAtom } from "./auth-store"
import io from "socket.io-client"
import {
  ChatClientSocket,
  ConversationType,
  MessageType,
  ReplyTo,
} from "@/src/types/socket/chat.type"
import { chatSocketAtom } from "./socket-store"
import { refreshAccessToken } from "@/src/utils/refresh-access-token"
import { NUM_MESSAGES_TO_LOAD, WS_BASE_URL } from "@/src/utils/constants"
import { getAttachmentAtom, notificationSoundAtom } from "./general-store"
import { atomWithStorage, createJSONStorage } from "jotai/utils"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import { router } from "expo-router"
import { Attachment } from "../types/attachment.type"
import { Alert } from "react-native"

const unreadMsgStorage = createJSONStorage<{
  [conversationId: string]: number
}>(() => AsyncStorage)
export const unreadMessagesAtom = atomWithStorage("unread-messages", {}, unreadMsgStorage)

export const conversationsAtom = atom<ConversationType[]>([])

export const currentConversationAtom = atom<ConversationType | null>(null)

export const activePostIdAtom = atom<string | null | undefined>(null)

export const messagesAtom = atom<MessageType[]>([])

export const chatAttachmentsAtom = atom<Attachment[]>([])

export const loadingAtom = atom(false)

export const entireChatLoadedAtom = atom(false)

export const receivedMsgAtom = atom(false) // used to trigger re-render when a new message is received

export const imgIndexAtom = atom(0)

export const bigImageViewAtom = atom<{ uri: string; id: string }[]>([])

export const replyingToAtom = atom<ReplyTo | null>(null)

export const highlightedMessageIdAtom = atom<string | null>(null)

export const currentLongPressedMessageAtom = atom<MessageType | null>(null)

export const editingMessageAtom = atom<MessageType | null>(null)

export const initChatAtom = atom(null, async (get, set) => {
  const user = await get(userAtom)
  const userJwt = await get(userSecureAtom)
  if (!user || !userJwt) return
  const currSocket = get(chatSocketAtom)
  if (currSocket && (currSocket.connected || get(loadingAtom))) return

  set(loadingAtom, true)

  const socket: ChatClientSocket = io(WS_BASE_URL + "/chat", {
    auth: {
      token: userJwt.accessToken,
    },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
  })

  set(chatSocketAtom, socket)

  function cleanup() {
    get(chatSocketAtom)?.disconnect()
    set(chatSocketAtom, null)
    set(conversationsAtom, [])
    set(currentConversationAtom, null)
    set(messagesAtom, [])
    set(loadingAtom, false)
  }

  socket.io.on("reconnect_failed", () => {
    cleanup()
  })

  socket.on("connected", () => {
    socket.emit("getConversations")
  })

  socket.on("disconnect", () => cleanup())

  socket.on("error", err => {
    console.error("WebSocket error event:", err)
    cleanup()
  })

  socket.on("connect_error", async () => {
    const accessToken = await refreshAccessToken(userJwt.refreshToken)
    if (accessToken === null) {
      set(logOutAtom)
      return
    }
    await set(userAtom, { ...user, accessToken })
    socket.io.opts.auth = { token: accessToken }
    socket.connect()
  })

  // Update the conversations list to include the new conversation
  socket.on("conversation", conversation => {
    set(conversationsAtom, prev => {
      const otherConversations = prev.filter(c => c._id !== conversation._id)
      return [conversation, ...otherConversations]
    })
  })

  // Got all conversations
  socket.on("conversations", conversations => {
    set(conversationsAtom, conversations)
    set(loadingAtom, false)
  })

  // Got all messages for a conversation
  socket.on("messages", async messages => {
    if (messages.length < NUM_MESSAGES_TO_LOAD) {
      set(entireChatLoadedAtom, true)
    }

    if (messages.length === 0) {
      set(loadingAtom, false)
      return
    }

    set(messagesAtom, [...get(messagesAtom), ...messages])

    const unreadMsgs = await get(unreadMessagesAtom)
    await set(unreadMessagesAtom, () => {
      const updated = { ...unreadMsgs }
      messages.forEach(msg => {
        if (msg.conversationId in updated) {
          delete updated[msg.conversationId]
        }
      })
      return updated
    })
    set(loadingAtom, false)
  })

  // Received a message from the server
  socket.on("message", async message => {
    // Update last message
    set(conversationsAtom, prev =>
      prev.map(conv => {
        if (conv._id === message.conversationId) {
          return {
            ...conv,
            lastMessage: {
              ...message,
              attachmentsCount: message.attachments ? message.attachments.length : 0,
            },
          }
        }
        return conv
      })
    )

    // we received a message from other user
    if (message.sender._id !== userJwt._id) {
      set(messagesAtom, prev => [message, ...prev])

      // If user is not in the chat that received the message
      const currentConversation = get(currentConversationAtom)
      if (currentConversation?._id !== message.conversationId) {
        Toast.show({
          type: "newMessage",
          props: {
            username: message.sender.username,
            message: message.content,
            picture: message.sender.picture,
            attachmentUrl:
              message.attachments && message.attachments.length > 0
                ? message.attachments[0]
                : undefined,
          },
          onPress: () => {
            set(prepareChatAtom, message.postId)
            router.push({
              pathname: "/chat-details",
              params: { conversationId: message.conversationId },
            })
            socket.emit("getMessages", {
              conversationId: message.conversationId,
              start: 0,
              end: NUM_MESSAGES_TO_LOAD,
            })
            Toast.hide()
          },
        })
        const player = get(notificationSoundAtom)
        if (!player) {
          console.warn("No audio player for notification sound")
        } else {
          player.seekTo(0)
          player.play()
        }
        const unreadMsgs = await get(unreadMessagesAtom)
        await set(unreadMessagesAtom, () => {
          if (message.conversationId in unreadMsgs) {
            return {
              ...unreadMsgs,
              [message.conversationId]: unreadMsgs[message.conversationId] + 1,
            }
          } else {
            return {
              ...unreadMsgs,
              [message.conversationId]: 1,
            }
          }
        })
      }
    }

    set(messagesAtom, prev =>
      prev.map(msg => {
        // This is our optimistic message, replace it
        if (msg.optimistic && msg.content === message.content) {
          return message
        }
        return msg
      })
    )

    set(receivedMsgAtom, prev => !prev) // trigger re-render for messages list
  })

  // Message was edited
  socket.on("messageEdited", async ({ messageId, conversationId, updatedAt, content }) => {
    set(messagesAtom, prev =>
      prev.map(msg => {
        // Update the edited message
        if (msg._id === messageId) {
          return { ...msg, content, updatedAt: new Date(updatedAt), isEdited: true }
        }
        // Update replyTo content if this message replies to the edited message
        if (msg.replyTo?._id === messageId) {
          return {
            ...msg,
            replyTo: { ...msg.replyTo, content },
          }
        }
        return msg
      })
    )

    set(receivedMsgAtom, prev => !prev)

    // Update lastMessage if this is the last message
    set(conversationsAtom, prev =>
      prev.map(conv => {
        if (conv._id === conversationId && conv.lastMessage?._id === messageId) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage!,
              content,
              updatedAt: new Date(updatedAt),
              isEdited: true,
            },
          }
        }
        return conv
      })
    )
  })

  socket.on("messageDeleted", ({ messageId, newLastMessage }) => {
    // Remove the deleted message and clean up any replies to it
    set(messagesAtom, prev =>
      prev
        .filter(msg => msg._id !== messageId)
        .map(msg => {
          // If this message was replying to the deleted message, clear the reply
          if (msg.replyTo?._id === messageId) {
            return { ...msg, replyTo: undefined, replyToDeleted: true }
          }
          return msg
        })
    )

    set(receivedMsgAtom, prev => !prev) // trigger re-render

    // Update lastMessage if this was the last message
    const currentConversation = get(currentConversationAtom)
    set(conversationsAtom, prev =>
      prev.map(conv => {
        if (conv._id === currentConversation?._id && conv.lastMessage?._id === messageId) {
          return { ...conv, lastMessage: newLastMessage }
        }
        return conv
      })
    )
  })
})

// Sends a message in a conversation
export const sendMessageAtom = atom(null, async (get, set, content: string) => {
  const editingMessage = get(editingMessageAtom)
  const attachments = get(chatAttachmentsAtom)
  const socket = get(chatSocketAtom)
  const user = await get(userAtom)
  const userSecure = await get(userSecureAtom)
  const currentConversation = get(currentConversationAtom)

  if (!socket || !user || !userSecure || !currentConversation) return
  if (!editingMessage && !content && attachments.length === 0) return

  const conversationId = currentConversation._id
  const postId = get(activePostIdAtom)

  if (editingMessage) {
    if (content === editingMessage.content) {
      // No changes, just cancel editing
      set(editingMessageAtom, null)
      return
    }

    // If message is empty, show delete confirmation alert
    if (!content.trim()) {
      Alert.alert("Delete Message", "Are you sure you want to delete this message?", [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await set(deleteMessageAtom, editingMessage._id, editingMessage.conversationId)
              set(editingMessageAtom, null)
            } catch (error) {
              console.error("Delete error:", error)
              Alert.alert("Error", "Failed to delete message")
            }
          },
          style: "destructive",
        },
      ])
      return
    }

    set(messagesAtom, prev =>
      prev.map(msg => {
        if (msg._id === editingMessage._id) {
          return {
            ...msg,
            content,
            isEdited: true,
            updatedAt: new Date(),
          }
        }
        return msg
      })
    )

    socket.emit("editMessage", {
      messageId: editingMessage._id,
      conversationId: editingMessage.conversationId,
      newContent: content,
    })
    set(editingMessageAtom, null)
    return
  }

  const replyTo = get(replyingToAtom)

  const optimisticMessage: MessageType = {
    _id: Math.random().toString(),
    conversationId,
    optimistic: true,
    sender: {
      _id: userSecure._id,
      username: user.username,
      picture: user.picture,
    },
    content,
    attachments: attachments.map(att => att.uri),
    replyTo,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Optimistically add the message to the list
  set(messagesAtom, prev => [optimisticMessage, ...prev])

  socket.emit("newMessage", {
    conversationId,
    postId,
    content,
    attachments,
    replyTo,
  })

  set(chatAttachmentsAtom, [])
  set(replyingToAtom, null)
})

export const sendAttachmentAtom = atom(null, async (get, set, option: "library" | "camera") => {
  const socket = get(chatSocketAtom)
  const user = await get(userAtom)
  if (!socket || !user) return

  // get the attachments
  const attachments = await set(getAttachmentAtom, false, option, true)

  if (!attachments) return
  set(chatAttachmentsAtom, attachments)

  // const conversationId = get(currentConversationAtom)?._id
  // socket.emit("newMessage", {
  //   conversationId,
  //   file: attachments[0].file,
  //   mimeType: attachments[0].mimeType,
  // })
})

// Delete a message in a conversation
export const deleteMessageAtom = atom(
  null,
  async (get, set, messageId: string, conversationId: string) => {
    const socket = get(chatSocketAtom)
    if (!socket) return

    set(messagesAtom, prev => prev.filter(msg => msg._id !== messageId))

    socket.emit("deleteMessage", {
      messageId,
      conversationId,
    })
  }
)

export const prepareChatAtom = atom(null, async (get, set, postId?: string | null) => {
  set(activePostIdAtom, postId)
  set(loadingAtom, true)
  set(entireChatLoadedAtom, false)
  set(messagesAtom, [])
})

export const cleanupChatAtom = atom(null, async (get, set) => {
  set(entireChatLoadedAtom, false)
  set(loadingAtom, false)
  set(messagesAtom, [])
  set(currentConversationAtom, null)
})

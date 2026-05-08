import { atom } from "jotai"
import { logOutAtom, userAtom, userSecureAtom } from "./auth-store"
import io from "socket.io-client"
import {
  ChatClientSocket,
  ConversationType,
  LastMessageType,
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
  })

  set(chatSocketAtom, socket)

  socket.io.on("reconnect_failed", () => {
    set(loadingAtom, false)
  })

  socket.on("connected", () => {
    console.log("Connected to WebSocket server for chatting")
    socket.emit("getConversations")
  })

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server for chatting")
    set(chatSocketAtom, null)
    set(conversationsAtom, [])
    set(currentConversationAtom, null)
    set(messagesAtom, [])
    set(loadingAtom, false)
  })

  socket.on("error", (err: any) => {
    console.error("WebSocket error event:", err)
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

  // New conversation created
  socket.on("conversation", (conversation: ConversationType) => {
    const exists = get(conversationsAtom).some(conv => conv._id === conversation._id)
    if (exists) return
    set(conversationsAtom, prev => [...prev, conversation])
  })

  // Got all conversations
  socket.on("conversations", (conversations: ConversationType[]) => {
    set(conversationsAtom, conversations)
    set(loadingAtom, false)
  })

  // Got all messages for a conversation
  socket.on("messages", async (messages: MessageType[]) => {
    if (messages.length === 0) {
      set(entireChatLoadedAtom, true)
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
  socket.on("message", async (message: MessageType) => {
    let isMyMessage = false

    set(messagesAtom, prev =>
      prev.map(msg => {
        // This is our optimistic message, replace it
        if (msg.optimistic && msg.content === message.content) {
          isMyMessage = true
          return message
        }
        return msg
      })
    )

    set(receivedMsgAtom, prev => !prev) // trigger re-render for messages list

    const currentConversation = get(currentConversationAtom)
    set(conversationsAtom, prev =>
      prev.map(conv => {
        if (conv._id === currentConversation?._id) {
          return {
            ...conv,
            lastMessage: {
              _id: message._id,
              sender: message.sender,
              content: message.content,
              attachmentsCount: message.attachments ? message.attachments.length : 0,
              createdAt: new Date(message.createdAt),
              updatedAt: new Date(message.updatedAt),
            },
          }
        }
        return conv
      })
    )

    // we received a message from other user
    if (!isMyMessage) {
      set(messagesAtom, prev => [message, ...prev])

      // If user is not in the chat that received the message
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
            router.push({
              pathname: "/chat-details",
              params: { id: message.conversationId },
            })
            socket.emit("getMessages", message.conversationId, 0, NUM_MESSAGES_TO_LOAD)
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
  })

  // Message was edited
  socket.on(
    "messageEdited",
    async ({
      messageId,
      conversationId,
      updatedAt,
      content,
    }: {
      messageId: string
      conversationId: string
      updatedAt: Date
      content: string
    }) => {
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
    }
  )

  socket.on(
    "messageDeleted",
    ({ messageId, newLastMessage }: { messageId: string; newLastMessage: LastMessageType }) => {
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
    }
  )
})

// Sends a message in a conversation
export const sendMessageAtom = atom(
  null,
  async (get, set, conversationId: string, content: string, replyToId?: string) => {
    const editingMessage = get(editingMessageAtom)
    const attachments = get(chatAttachmentsAtom)
    const socket = get(chatSocketAtom)
    const user = await get(userAtom)
    const userSecure = await get(userSecureAtom)

    if (!socket || !user || !userSecure) return
    if (!editingMessage && !content && attachments.length === 0) return

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
      content,
      attachments,
      replyTo,
    })

    set(chatAttachmentsAtom, [])
    set(replyingToAtom, null)
  }
)

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

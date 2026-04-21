import { atom } from "jotai"
import { logOutAtom, userAtom, userJwtAtom } from "./auth-store"
import io from "socket.io-client"
import { ConversationType, MessageType } from "@/src/types/chat.type"
import { chatSocketAtom } from "./socket-store"
import { refreshAccessToken } from "@/src/utils/refresh-access-token"
import { NUM_MESSAGES_TO_LOAD, WS_BASE_URL } from "@/src/utils/constants"
import { getAttachmentAtom, notificationSoundAtom } from "./general-store"
import { atomWithStorage, createJSONStorage } from "jotai/utils"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import { router } from "expo-router"
import { Attachment } from "../types/attachment.type"

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

export const replyingToAtom = atom<MessageType | null>(null)

export const highlightedMessageIdAtom = atom<string | null>(null)

export const currentLongPressedMessageAtom = atom<MessageType | null>(null)

export const initChatAtom = atom(null, async (get, set) => {
  const user = await get(userAtom)
  const userJwt = await get(userJwtAtom)
  if (!user || !userJwt) return
  const currSocket = get(chatSocketAtom)
  if (currSocket && (currSocket.connected || get(loadingAtom))) return

  set(loadingAtom, true)

  const socket = io(WS_BASE_URL + "/chat", {
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

  socket.on("lastMessageUpdated", (conversationId: string, lastMessage: MessageType) => {
    set(conversationsAtom, prev =>
      prev.map(conv => {
        if (conv._id === conversationId) {
          return { ...conv, lastMessage }
        }
        return conv
      })
    )
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
    let isOptimistic = true

    set(messagesAtom, prev =>
      prev.map(msg => {
        // This is our optimistic message, replace it
        if (msg.optimistic && msg.content === message.content) {
          isOptimistic = false
          return message
        }
        return msg
      })
    )

    set(receivedMsgAtom, prev => !prev) // trigger re-render for messages list

    // Update lastMessage for this conversation
    set(conversationsAtom, prev =>
      prev.map(conv => {
        if (conv._id === message.conversationId) {
          return { ...conv, lastMessage: message }
        }
        return conv
      })
    )

    // we received a message from other user
    if (isOptimistic) {
      set(messagesAtom, prev => [message, ...prev])

      // If user is not in the chat that received the message
      if (get(currentConversationAtom)?._id !== message.conversationId) {
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
})

// Sends a message in a conversation
export const sendMessageAtom = atom(
  null,
  async (get, set, conversationId: string, content: string, replyToId?: string) => {
    const socket = get(chatSocketAtom)
    const user = await get(userAtom)
    if (!socket || !user) return

    const attachments = get(chatAttachmentsAtom)
    const replyingTo = get(replyingToAtom)

    const optimisticMessage: MessageType = {
      _id: Math.random().toString(),
      conversationId,
      optimistic: true,
      sender: {
        _id: Math.random().toString(),
        username: user.username,
        picture: user.picture,
      },
      content,
      attachments: attachments.map(att => att.uri),
      replyTo: replyingTo
        ? {
            _id: replyingTo._id,
            content: replyingTo.content || "",
            attachments: replyingTo.attachments || [],
            sender: replyingTo.sender,
          }
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Optimistically add the message to the list
    set(messagesAtom, prev => [optimisticMessage, ...prev])

    socket.emit("newMessage", {
      conversationId,
      content,
      attachments,
      replyTo: replyToId || (replyingTo ? replyingTo._id : undefined),
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

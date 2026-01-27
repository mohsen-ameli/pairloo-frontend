import { atom } from "jotai"
import { userAtom } from "./auth-store"
import io from "socket.io-client"
import { ConversationType, MessageType } from "@/src/types/chat.type"
import { chatSocketAtom } from "./socket-store"
import { refreshAccessToken } from "@/src/utils/refresh-access-token"
import { WS_BASE_URL } from "@/src/utils/constants"
import { getAttachmentAtom, notificationSoundAtom } from "./general-store"
import { atomWithStorage, createJSONStorage } from "jotai/utils"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import { router } from "expo-router"

const unreadMsgStorage = createJSONStorage<{
  [conversationId: string]: number
}>(() => AsyncStorage)
export const unreadMessagesAtom = atomWithStorage("unread-messages", {}, unreadMsgStorage)

export const conversationsAtom = atom<ConversationType[]>([])

export const currentConversationAtom = atom<ConversationType | null>(null)

export const messagesAtom = atom<MessageType[]>([])

export const loadingAtom = atom(false)

export const initChatAtom = atom(null, async (get, set) => {
  const user = await get(userAtom)
  if (!user) return
  if (get(chatSocketAtom)) return

  const socket = io(WS_BASE_URL + "/chat", {
    auth: {
      token: user.accessToken,
    },
  })

  set(chatSocketAtom, socket)

  socket.on("connected", () => {
    console.log("Connected to WebSocket server for chatting")
    socket.emit("getConversations")
  })

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server for chatting")
    set(chatSocketAtom, null)
    set(conversationsAtom, [])
    set(messagesAtom, [])
  })

  socket.on("error", (err: any) => {
    console.error("WebSocket error event:", err)
  })

  socket.on("connect_error", async () => {
    const accessToken = await refreshAccessToken(user.refreshToken)
    if (accessToken === null) {
      socket.disconnect()
      set(userAtom, null)
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
    set(messagesAtom, messages)
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
    let isOptimistic = false
    set(messagesAtom, prev =>
      prev.map(msg => {
        // This is our optimistic message, replace it
        if (msg.optimistic && msg.content === message.content) {
          isOptimistic = true
          return message
        }
        return msg
      })
    )

    // we received a message from other user
    if (!isOptimistic) {
      set(messagesAtom, prev => [...prev, message])

      // If user is not in the chat that received the message
      if (get(currentConversationAtom)?._id !== message.conversationId) {
        Toast.show({
          type: "newMessage",
          props: {
            username: message.sender.username,
            message: message.content,
            picture: message.sender.picture,
            attachmentUrl: message.attachment?.url,
          },
          onPress: () => {
            router.push({
              pathname: "/chat-details",
              params: { id: message.conversationId },
            })
            socket.emit("getMessages", message.conversationId)
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
  async (get, set, conversationId: string, content: string) => {
    const socket = get(chatSocketAtom)
    const user = await get(userAtom)
    if (!socket || !user) return

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
      attachment: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Optimistically add the message to the list
    set(messagesAtom, prev => [...prev, optimisticMessage])

    socket.emit("newMessage", {
      conversationId,
      content,
    })
  }
)

export const sendAttachmentAtom = atom(null, async (get, set, option: "library" | "camera") => {
  const socket = get(chatSocketAtom)
  const user = await get(userAtom)
  const conversationId = get(currentConversationAtom)?._id
  if (!socket || !user) return

  // get the attachments
  const attachments = await set(getAttachmentAtom, false, option, false)

  socket.emit("newMessage", {
    conversationId,
    file: attachments[0].file,
    mimeType: attachments[0].mimeType,
  })
})

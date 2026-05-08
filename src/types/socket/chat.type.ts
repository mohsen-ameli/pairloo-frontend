import { Socket } from "socket.io-client"
import { Attachment } from "../attachment.type"

// THIS FILE SHOULD BE KEPT IN SYNC WITH THE BACKEND

export type SenderType = {
  _id: string
  username: string
}

export type ReplyTo =
  | null
  | undefined
  | {
      _id: string
      content?: string
      attachmentsCount: number
      sender: SenderType
      createdAt?: Date
      updatedAt?: Date
    }

export type MessageType = {
  _id: string
  conversationId: string
  optimistic?: boolean
  sender: {
    _id: string
    username: string
    picture?: string | null
  }
  content: string
  attachments?: string[]
  replyTo?: ReplyTo
  replyToDeleted?: boolean
  isEdited?: boolean
  createdAt: Date
  updatedAt: Date
}

export type LastMessageType =
  | null
  | undefined
  | {
      _id: string
      sender: SenderType
      content: string
      attachmentsCount: number
      createdAt: Date
      updatedAt: Date
    }

export interface ConversationType {
  _id: string
  members: {
    _id: string
    username: string
    picture?: string | null
    email: string
  }[]
  lastMessage?: LastMessageType
}

export type OtherUser = {
  _id: string
  username: string
  picture?: string | null
  email: string
}

interface ServerToClientEvents {
  conversation: (data: ConversationType) => void
  error: (message: string) => void
  messages: (data: MessageType[]) => void
  messageEdited: (data: {
    messageId: string
    conversationId: string
    updatedAt: Date
    content: string
  }) => void
  conversations: (data: ConversationType[]) => void
  messageDeleted: (data: { messageId: string; newLastMessage: LastMessageType }) => void
  message: (data: MessageType) => void
  connected: (data: string) => void
}

interface ClientToServerEvents {
  newMessage: (data: {
    conversationId: string
    content: string
    attachments?: Attachment[]
    replyTo?: ReplyTo
  }) => void
  getConversations: () => void
  newConversation: (memberIds: string[]) => void
  getMessages: (conversationId: string, start: number, end: number) => void
  editMessage: (data: { messageId: string; conversationId: string; newContent: string }) => void
  deleteMessage: (data: { messageId: string; conversationId: string }) => void
}

export type ChatClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>

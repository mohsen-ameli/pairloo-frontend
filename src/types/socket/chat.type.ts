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
      conversationId: string
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
  postId?: string | undefined
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
      conversationId: string
      postId?: string
      sender: SenderType
      content: string
      attachmentsCount: number
      replyToDeleted?: boolean
      isEdited?: boolean
      createdAt: Date
      updatedAt: Date
    }

export type ContactedPost = {
  postId: string
  title: string
  isDeleted: boolean
}

export interface ConversationType {
  _id: string
  members: {
    _id: string
    username: string
    picture?: string | null
    email: string
  }[]
  contactedPosts: ContactedPost[]
  lastMessage?: LastMessageType
}

export type OtherUser = {
  _id: string
  username: string
  picture?: string | null
  email: string
}

interface ServerToClientEvents {
  conversation: (initiatorId: string, conversation: ConversationType, postId?: string) => void
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
  typing: (data: {
    userId: string
    conversationId: string
    postId?: string | null
    isTyping: boolean
  }) => void
  connected: () => void
}

interface ClientToServerEvents {
  newMessage: (data: {
    conversationId: string
    postId?: string | null
    content: string
    attachments?: Attachment[]
    replyTo?: ReplyTo
  }) => void
  getConversations: () => void
  getConversation: (initiatorId: string, memberIds: string[], postId?: string) => void
  getMessages: (data: {
    conversationId: string
    postId?: string | null
    start: number
    end: number
  }) => void
  editMessage: (data: { messageId: string; conversationId: string; newContent: string }) => void
  deleteMessage: (data: { messageId: string; conversationId: string }) => void
  isTyping: (data: { conversationId: string; postId?: string | null; status: boolean }) => void
}

export type ChatClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>

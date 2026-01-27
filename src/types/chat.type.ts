import { s3Object } from "./s3object.type"

export type MessageType = {
  _id: string
  conversationId: string
  optimistic?: boolean
  sender: {
    _id: string
    username: string
    picture?: s3Object | null
  }
  content?: string
  attachment?: s3Object | null
  createdAt: string
  updatedAt: string
}

export interface ConversationType {
  _id: string
  members: {
    _id: string
    username: string
    picture?: s3Object | null
    email: string
  }[]
  lastMessage?: MessageType
}

export type OtherUser = {
  _id: string
  username: string
  picture?: string | null
  email: string
}

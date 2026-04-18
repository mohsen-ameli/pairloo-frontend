export type MessageType = {
  _id: string
  conversationId: string
  optimistic?: boolean
  sender: {
    _id: string
    username: string
    picture?: string | null
  }
  content?: string
  attachments?: string[]
  replyTo?: {
    _id: string
    content?: string
    attachments?: string[]
    sender: {
      _id: string
      username: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface ConversationType {
  _id: string
  members: {
    _id: string
    username: string
    picture?: string | null
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

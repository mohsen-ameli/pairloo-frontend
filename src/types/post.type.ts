export type QnaItemType = {
  _id: string
  question: {
    type: "short_answer" | "multiple_choice" | "multi_select"
    question: string
    options?: string[]
  }
  answer: string[]
}

export type StatusType = "Active" | "Inactive" | "Hidden" | "Draft"

export type GeneralPostType = {
  _id: string // postId
  userId: string
  username: string
  firstName: string
  lastName: string
  picture?: string | null
  title: string
  description: string
  images?: string[] | null | undefined
  createdAt: Date
  location?: {
    latitude: number
    longitude: number
  }
  distance?: number
  score: number
  status: StatusType
}

export interface MyPostType {
  _id: string
  images: string[]
  title: string
  description: string
  publicPost: boolean
  status: StatusType
  qna?: QnaItemType[]
  location?: {
    latitude: number
    longitude: number
  }
  distance?: number
  createdAt: Date
  closestPosts?: Array<{
    postId: string
    userId: string
    picture?: string | null
    username: string
    firstName: string
    lastName: string
    title: string
    images?: string[] | null
    score: number
    createdAt: Date
  }>
}

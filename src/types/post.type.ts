export type QnaItemType = {
  _id: string
  question: {
    type: "short_answer" | "multiple_choice" | "multi_select"
    question: string
    options?: string[]
  }
  answer: string[]
}

export type GeneralPostType = {
  _id: string // userId of the poster
  username: string
  firstName: string
  lastName: string
  picture?: string | null
  title: string
  description: string
  summary: string
  images?: string[] | null | undefined
  createdAt: string
  location?: {
    latitude: number
    longitude: number
  }
  distance?: number
}

export interface MyPostType {
  _id: string
  images: string[]
  title: string
  description: string
  publicPost: boolean
  isDraft: boolean
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

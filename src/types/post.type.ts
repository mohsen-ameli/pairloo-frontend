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
  content: string
  summary: string
  images?: string[] | null | undefined
  createdAt: string
}

export interface ClosestPostType extends GeneralPostType {
  item: string
  score: string
  qna?: QnaItemType[]
}

export interface MyPostType extends GeneralPostType {
  qna?: QnaItemType[]
  closestPosts?: ClosestPostType[]
}

export interface MyPosts {
  _id: string
  title: string
  content: string
  createdAt: string
  images?: string[] | null
  isDraft?: boolean
  closestPosts?: Array<{ score: number; item: string }> | null
}

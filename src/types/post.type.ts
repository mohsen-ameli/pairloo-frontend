import { s3Object } from "./s3object.type"

export type GeneralPostType = {
  _id: string // userId of the poster
  username: string
  firstName: string
  lastName: string
  picture?: s3Object | null
  title: string
  content: string
  summary: string
  images?: s3Object[] | null | undefined
  createdAt: string
}

export interface ClosestPostType extends GeneralPostType {
  item: string
  score: string
}

export interface MyPostType extends GeneralPostType {
  closestPosts?: ClosestPostType[]
}

export interface MyPosts {
  _id: string
  title: string
  content: string
  createdAt: string
  images?: s3Object[] | null
  isDraft?: boolean
}

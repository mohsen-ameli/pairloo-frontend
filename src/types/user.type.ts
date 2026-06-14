import { GeneralPostType } from "./post.type"

export type ProfileSocialUserType = {
  _id: string
  picture: string | null
  username: string
  firstName: string
  lastName: string
}

// Basic user info stored in async storage
export type UserType = null | {
  username: string
  firstName: string
  lastName: string
  picture: string
  phoneNumber: string
  country: string
  city: string
  state: string
  latitude: number
  longitude: number
  timezone: string
  locationId: number // reference to Location _id
  email: string
  expoPushToken?: string
  savedPosts?: string[]
  followersCount: number
  followingCount: number
  createdAt: Date
  updatedAt: Date
}

export type GeneralUserProfileType = UserType & {
  posts: GeneralPostType[]
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

export type UserSocialType = {
  followers: ProfileSocialUserType[]
  following: ProfileSocialUserType[]
  followersCount: number
  followingCount: number
}

export type ReviewsType = {
  ratingCount: number
  ratingAvg: number
  reviews: {
    rating: number
    review: string
    createdAt: Date
    reviewer: {
      _id: string
      picture: string
      username: string
      firstName: string
      lastName: string
    }
  }[]
}

// JWT tokens stored in secure storage
export type UserSecureType = null | {
  _id: string
  isAuthenticated: boolean
  accessToken?: string
  refreshToken?: string
  expoPushToken?: string
}

// Any errors related to authentication fields
export type AuthErrorType = {
  username?: string
  firstName?: string
  lastName?: string
  location?: string
  email?: string
  emailVerify?: string
  phoneNumber?: string
  phoneVerify?: string
  general?: string
}

export type AuthResponseType = {
  _id: string
  accessToken?: string
  refreshToken?: string
  errors?: AuthErrorType
}

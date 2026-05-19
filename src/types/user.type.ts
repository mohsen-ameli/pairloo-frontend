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
  createdAt: Date
  updatedAt: Date
}

export type MyUserType = UserType & {
  followersCount: number
  followingCount: number
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
  accessToken: string
  refreshToken: string
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

// Response type from backend after successful authentication
// Will be broken up into the jwt portion and the user profile
export type RegisteredUserType = {
  errors?: AuthErrorType
  _id: string
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
  locationId: number
  email: string
  createdAt: Date
  updatedAt: Date
  accessToken: string
  refreshToken: string
}

// Type of a new user being registered
export type NewUserType = {
  username: string
  firstName: string
  lastName: string
  picture: string
  pictureBlob: Blob | null
  pictureMimeType: string
  email: string
  emailCode: string
  emailVerified: boolean
  phoneNumber: string
  phoneCode: string
  phoneVerified: boolean
  country: string
  city: string
  state: string
  location: {
    type: string
    coordinates: [number, number] // [longitude, latitude]
  }
  timezone: string
  locationId: number
  cca2: string
  callingCode: string
}

import { CountryCode } from "react-native-country-picker-modal"
import { MyPostType } from "./post.type"

// User profile type stored in async storage
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
  posts: MyPostType[]
  createdAt: Date
  updatedAt: Date
}

// JWT tokens stored in secure storage
export type UserJwtType = null | {
  _id: string
  accessToken: string
  refreshToken: string
}

// Any errors related to authentication fields
export type AuthErrorType = {
  username?: string
  firstName?: string
  lastName?: string
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
  email: string
  emailCode: string
  emailVerified: boolean
  phoneNumber: string
  phoneCode: string
  phoneVerified: boolean
  country: string
  city: string
  state: string
  latitude: number
  longitude: number
  timezone: string
  locationId: number
  cca2: CountryCode
  callingCode: string
}

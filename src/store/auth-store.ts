import { atom } from "jotai"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { atomWithStorage, createJSONStorage } from "jotai/utils"
import { BASE_URL, VERIFICATION_RESEND_TIME } from "@/src/utils/constants"
import {
  AuthErrorType,
  NewUserType,
  RegisteredUserType,
  UserJwtType,
  UserType,
} from "@/src/types/user.type"
import { chatSocketAtom, createPostSocketAtom } from "./socket-store"
import z from "zod"
import { currPageAtom, flowAtom, resetPagerAtom } from "./pager-store"
import { Alert } from "react-native"
import { router } from "expo-router"
import { getAttachmentAtom } from "./general-store"
import Toast from "react-native-toast-message"
import { refreshAccessToken } from "../utils/refresh-access-token"
import { FetchRequestInit } from "expo/fetch"

const returningUser = {
  email: "",
  emailCode: "",
}
const returningUserStorage = createJSONStorage<typeof returningUser>(() => AsyncStorage)
export const returningUserAtom = atomWithStorage(
  "returning-user",
  returningUser,
  returningUserStorage
)

// For the sign up process
const newUser: NewUserType = {
  username: "",
  firstName: "",
  lastName: "",
  picture: "",
  pictureBlob: null as Blob | null,
  pictureMimeType: "",
  email: "",
  emailVerified: false,
  emailCode: "",
  phoneNumber: "",
  phoneVerified: false,
  phoneCode: "",
  state: "",
  city: "",
  latitude: 0,
  longitude: 0,
  timezone: "",
  locationId: 0,
  country: "Canada",
  cca2: "CA",
  callingCode: "1",
}
const newUserStorage = createJSONStorage<NewUserType>(() => AsyncStorage)
export const newUserAtom = atomWithStorage("new-user", newUser, newUserStorage)

export const authErrorsAtom = atom<AuthErrorType | null>(null)

export const resendTimerAtom = atom(0)

// user atom
const userSecureStorage = createJSONStorage<UserJwtType>(() => ({
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key)
  },
}))
export const userJwtAtom = atomWithStorage("user-jwt", null, userSecureStorage)

const userAsyncStorage = createJSONStorage<UserType>(() => AsyncStorage)
export const userAtom = atomWithStorage("user-profile", null, userAsyncStorage)

export const signUpAtom = atom(null, async (get, set) => {
  try {
    const userData = await get(newUserAtom)
    const payload = {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: `+${userData.callingCode}${userData.phoneNumber}`,
      country: userData.country,
      city: userData.city,
      state: userData.state,
      latitude: userData.latitude,
      longitude: userData.longitude,
      timezone: userData.timezone,
      locationId: userData.locationId,
    }

    const formData = new FormData()

    Object.entries(payload).forEach(([key, value]) => {
      if (value) formData.append(key, value.toString())
    })

    if (userData.picture) {
      const extension = (userData.pictureMimeType || "image/jpeg").split("/")[1] || "jpg"
      formData.append("picture", {
        uri: userData.picture,
        name: `profile.${extension}`,
        type: userData.pictureMimeType || "image/jpeg",
      } as any)
    } else if (userData.pictureBlob) {
      formData.append("picture", userData.pictureBlob, "profile.jpg")
    }

    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      body: formData,
    })
    const data: RegisteredUserType = await res.json()

    if (!res.ok && data.errors) {
      set(authErrorsAtom, data.errors)
      return false
    } else {
      set(userJwtAtom, {
        _id: data._id,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      set(fetchUserInfoAtom)
      set(authErrorsAtom, null)
      set(newUserAtom, newUser)
      set(resetPagerAtom)
      Alert.alert("Success", "Account created successfully!")
      router.replace("/")
      return true
    }
  } catch (error: any) {
    set(authErrorsAtom, { ...get(authErrorsAtom), general: error.message })
    return false
  }
})

export const logOutAtom = atom(null, async (get, set, showAlert: boolean = false) => {
  async function logout() {
    await set(userAtom, null)
    await set(userJwtAtom, null)
    await set(newUserAtom, newUser)
    set(authErrorsAtom, null)
    set(resetPagerAtom)

    // Clean chat socket
    const chatSocket = get(chatSocketAtom)
    chatSocket?.disconnect()
    set(chatSocketAtom, null)

    // Clean create post socket
    const createPostSocket = get(createPostSocketAtom)
    createPostSocket?.disconnect()
    set(createPostSocketAtom, null)
  }

  if (!showAlert) {
    await logout()
    return
  }

  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Logout",
      style: "destructive",
      onPress: logout,
    },
  ])
})

export const requestEmailVerificationAtom = atom(
  null,
  async (get, set, isSignUp: boolean, resending: boolean) => {
    const errors = get(authErrorsAtom)
    const flow = get(flowAtom)
    let email: string
    if (isSignUp) {
      const newUser = await get(newUserAtom)
      email = newUser.email.trim().toLowerCase()
    } else {
      const returningUser = await get(returningUserAtom)
      email = returningUser.email.trim().toLowerCase()
    }

    const emailSchema = z.email()
    if (!emailSchema.safeParse(email).success) {
      set(authErrorsAtom, {
        ...errors,
        email: "Please enter a valid email address",
      })
      return
    }
    set(flowAtom, { ...flow, nextEnabled: false })

    try {
      const res = await fetch(`${BASE_URL}/api/auth/request-email-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, isSignUp }),
      })
      const data = await res.json()

      if (!res.ok && !isSignUp) {
        set(authErrorsAtom, {
          ...errors,
          email: data.error,
        })
        set(flowAtom, { ...flow, nextEnabled: true })
        return
      } else if (!res.ok && isSignUp) {
        set(authErrorsAtom, {
          ...errors,
          email: data.error,
        })
        set(flowAtom, { ...flow, nextEnabled: true })
        return
      }
      set(currPageAtom, curr => curr + 1)
      set(resendTimerAtom, VERIFICATION_RESEND_TIME)
      set(flowAtom, { ...flow, nextEnabled: true })

      let intervalId: number | null = null
      intervalId = setInterval(() => {
        set(resendTimerAtom, prev => {
          if (prev <= 1) {
            if (intervalId) clearInterval(intervalId)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      if (res.ok && resending) {
        Alert.alert("Note", "Please check your email for the verification code")
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        email: "Failed to send verification code",
      })
      set(flowAtom, { ...flow, nextEnabled: true })
    }
  }
)

export const verifyEmailCodeAtom = atom(null, async (get, set, isSignUp: boolean) => {
  const errors = get(authErrorsAtom)
  const flow = get(flowAtom)
  let email: string, code: string
  if (isSignUp) {
    const newUser = await get(newUserAtom)
    email = newUser.email
    code = newUser.emailCode
  } else {
    const returningUser = await get(returningUserAtom)
    email = returningUser.email
    code = returningUser.emailCode
  }

  const verifySchema = z.string().min(6).max(6)
  if (!verifySchema.safeParse(code).success) {
    set(authErrorsAtom, {
      ...errors,
      emailVerify: "Invalid verification code",
    })
    return
  }
  set(flowAtom, { ...flow, nextEnabled: false })

  try {
    const res = await fetch(`${BASE_URL}/api/auth/verify-email-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code, isSignUp }),
    })
    const data: RegisteredUserType = await res.json()

    if (res.ok) {
      if (isSignUp) {
        set(currPageAtom, get(currPageAtom) + 1)
        set(newUserAtom, { ...get(newUserAtom), emailVerified: true })
      } else {
        set(userJwtAtom, {
          _id: data._id,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
        const user = await set(fetchUserInfoAtom)
        set(authErrorsAtom, null)
        set(returningUserAtom, returningUser)
        set(resetPagerAtom)

        router.replace("/")

        Toast.show({
          type: "success",
          text1: "Welcome back, " + user?.username + "!",
          text1Style: { fontSize: 16, fontWeight: "bold" },
          position: "top",
          visibilityTime: 3000,
        })
      }
    } else if (data.errors && data.errors.general) {
      set(authErrorsAtom, {
        ...errors,
        emailVerify: data.errors.general,
      })
    }
  } catch {
    set(authErrorsAtom, {
      ...errors,
      emailVerify: "Failed to verify code. Please try again.",
    })
  }
  set(flowAtom, { ...flow, nextEnabled: true })
})

export const requestPhoneNumberVerificationAtom = atom(
  null,
  async (get, set, resending: boolean) => {
    const newUser = await get(newUserAtom)
    const errors = get(authErrorsAtom)
    const flow = get(flowAtom)
    const callingCode = newUser.callingCode
    const phoneNumber = newUser.phoneNumber

    if (newUser.phoneVerified) {
      set(currPageAtom, get(currPageAtom) + 1)
      set(flowAtom, { ...flow, nextEnabled: true })
      return
    }

    const phoneSchema = z.string().min(9, "Invalid phone number")
    if (!phoneSchema.safeParse(phoneNumber).success) {
      set(authErrorsAtom, {
        ...errors,
        phoneNumber: "Please enter a valid phone number",
      })
      return
    }
    set(flowAtom, { ...flow, nextEnabled: false })

    try {
      const res = await fetch(`${BASE_URL}/api/auth/request-phone-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callingCode, phoneNumber }),
      })
      const data = await res.json()

      if (!res.ok) {
        set(authErrorsAtom, {
          ...errors,
          phoneNumber: data.error,
        })
        set(flowAtom, { ...flow, nextEnabled: true })
        return
      }
      set(currPageAtom, get(currPageAtom) + 1)
      set(resendTimerAtom, VERIFICATION_RESEND_TIME)
      set(flowAtom, { ...flow, nextEnabled: true })

      let intervalId: number | null = null
      intervalId = setInterval(() => {
        set(resendTimerAtom, prev => {
          if (prev <= 1) {
            if (intervalId) clearInterval(intervalId)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      if (res.ok && resending) {
        Alert.alert("Note", "Please check your phone for the verification code")
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        phoneNumber: "Failed to send verification code. Please try again.",
      })
      set(flowAtom, { ...flow, nextEnabled: true })
    }
  }
)

export const verifyPhoneNumberVerificationAtom = atom(null, async (get, set) => {
  const newUser = await get(newUserAtom)
  const errors = get(authErrorsAtom)
  const code = newUser.phoneCode
  const callingCode = newUser.callingCode
  const phoneNumber = newUser.phoneNumber

  const verifySchema = z.string().min(6).max(6)
  if (!verifySchema.safeParse(code).success) {
    set(authErrorsAtom, {
      ...errors,
      phoneNumber: "Invalid verification code",
    })
    return
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/verify-phone-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ callingCode, phoneNumber, code }),
    })

    if (res.ok) {
      set(currPageAtom, get(currPageAtom) + 1)
      set(newUserAtom, { ...newUser, phoneVerified: true })
    } else {
      set(authErrorsAtom, {
        ...errors,
        phoneVerify: "Invalid verification code",
      })
    }
  } catch {
    set(authErrorsAtom, {
      ...errors,
      phoneVerify: "Invalid verification code",
    })
  }
})

export const verifyUserInfoAtom = atom(null, async (get, set) => {
  const errors = get(authErrorsAtom)
  const newUser = await get(newUserAtom)
  if (!newUser.username) {
    set(authErrorsAtom, { ...errors, username: "Username is required" })
    return
  } else if (!newUser.firstName) {
    set(authErrorsAtom, { ...errors, firstName: "First name is required" })
    return
  } else if (!newUser.lastName) {
    set(authErrorsAtom, { ...errors, lastName: "Last name is required" })
    return
  } else if (!newUser.locationId) {
    set(authErrorsAtom, { ...errors, location: "Location is required" })
    return
  }
  set(currPageAtom, get(currPageAtom) + 1)
})

export const setUserPictureAtom = atom(null, async (get, set, option: "library" | "camera") => {
  const attachments = await set(getAttachmentAtom, true, option, false)
  if (!attachments) return

  set(newUserAtom, f => ({
    ...f,
    picture: attachments[0].uri,
    pictureBlob: attachments[0].file,
    pictureMimeType: attachments[0].mimeType,
  }))
})

export const authFetchAtom = atom(
  null,
  async (get, set, url: string, options: FetchRequestInit = {}) => {
    // Attach access token
    function fetchWithToken(token: string) {
      return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    }

    const user = await get(userJwtAtom)

    if (!user) {
      throw new Error("User is not authenticated")
    }

    try {
      const res = await fetchWithToken(user.accessToken)

      if (res.status === 401 || res.status === 403) {
        const accessToken = await refreshAccessToken(user.refreshToken)

        if (accessToken !== null) {
          set(userJwtAtom, { ...user, accessToken })
          const newRes = await fetchWithToken(accessToken)
          return newRes
        } else {
          set(logOutAtom)
          throw new Error("Session expired. Please log in again.")
        }
      }

      return res
    } catch (error: any) {
      throw new Error("Network error occurred: ", error)
    }
  }
)

export const fetchUserInfoAtom = atom(null, async (get, set) => {
  const res = await set(authFetchAtom, "/api/users/my-user")
  const data: UserType = await res.json()
  if (res.ok) {
    set(userAtom, data)
    return data
  } else {
    console.error("Failed to fetch user info:", data)
    return null
  }
})

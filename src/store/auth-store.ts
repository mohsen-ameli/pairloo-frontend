import { atom } from "jotai"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { atomWithStorage, createJSONStorage } from "jotai/utils"
import { BASE_URL, VERIFICATION_RESEND_TIME } from "@/src/utils/constants"
import { AuthErrorType, AuthResponseType, UserSecureType, UserType } from "@/src/types/user.type"
import { chatSocketAtom, createPostSocketAtom } from "./socket-store"
import z from "zod"
import { currPageAtom, flowAtom, resetPagerAtom } from "./pager-store"
import { Alert, Platform } from "react-native"
import { router } from "expo-router"
import { getAttachmentAtom, greetAtom } from "./general-store"
import Toast from "react-native-toast-message"
import { FetchRequestInit } from "expo/fetch"
import { incrementAttemptsAtom, resetDeviceInfoAtom } from "./device-store"

// For the login process
const returningUser = {
  email: "",
  emailCode: "",
}
export const returningUserAtom = atom(returningUser)

// For the sign up process
const newUser = {
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
  location: {
    type: "Point",
    coordinates: [0, 0], // [longitude, latitude]
  },
  timezone: "",
  locationId: 0,
  country: "Canada",
  cca2: "CA",
  callingCode: "1",
}
export type NewUserType = typeof newUser
export const newUserAtom = atom(newUser)

export const authErrorsAtom = atom<AuthErrorType | null>(null)

export const resendTimerAtom = atom(0) // remaining seconds before verification code can be resent
export const emailAttemptsAtom = atom(null as [string, number] | null) // [email, intervalId] singular
export const phoneAttemptsAtom = atom(null as [string, number] | null) // [phone, intervalId] singular

const userSecureStorage = createJSONStorage<UserSecureType>(() => ({
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      return AsyncStorage.getItem(key)
    }

    return await SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      AsyncStorage.setItem(key, value)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      AsyncStorage.removeItem(key)
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  },
}))
const userSecureDefault: UserSecureType = {
  _id: "",
  isAuthenticated: false,
}
// User secure atom that contains _id, and JWT tokens (if on native)
export const userSecureAtom = atomWithStorage("user-secure", userSecureDefault, userSecureStorage)

// User atom with storage that contains user info
export const userAtom = atom<UserType>(null)

export const resetRegistrationAtom = atom(null, async (get, set) => {
  async function discard() {
    set(newUserAtom, newUser)
    set(returningUserAtom, returningUser)
    set(authErrorsAtom, null)
    set(resetPagerAtom)
  }

  if (Platform.OS === "web") {
    if (window.confirm("Are you sure you want to discard the registration?")) {
      discard()
    }
    return
  }

  Alert.alert("Discard Registration", "Are you sure you want to discard the registration?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Discard",
      style: "destructive",
      onPress: discard,
    },
  ])
})

export const signUpAtom = atom(null, async (get, set) => {
  try {
    const userData = get(newUserAtom)
    const payload = {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: `+${userData.callingCode}${userData.phoneNumber}`,
      country: userData.country,
      city: userData.city,
      state: userData.state,
      longitude: userData.location.coordinates[0],
      latitude: userData.location.coordinates[1],
      timezone: userData.timezone,
      locationId: userData.locationId,
      platform: Platform.OS,
    }

    const formData = new FormData()

    Object.entries(payload).forEach(([key, value]) => {
      if (value) formData.append(key, value.toString())
    })

    if (userData.pictureBlob) {
      formData.append("picture", userData.pictureBlob)
    } else if (userData.picture) {
      formData.append("picture", userData.picture)
    }

    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      body: formData,
      credentials: Platform.OS === "web" ? "include" : "same-origin",
    })
    const data: AuthResponseType = await res.json()

    if (!res.ok && data.errors) {
      set(authErrorsAtom, data.errors)
      return
    } else {
      await set(userSecureAtom, { ...data, isAuthenticated: true })
      set(returningUserAtom, returningUser)
      set(newUserAtom, newUser)
      await set(resetDeviceInfoAtom)
      set(authErrorsAtom, null)
      set(resetPagerAtom)

      set(greetAtom, curr => !curr)
      router.replace("/")

      return
    }
  } catch (error: any) {
    set(authErrorsAtom, { ...get(authErrorsAtom), general: error.message })
    return
  }
})

export const logOutAtom = atom(null, async (get, set, showAlert: boolean = false) => {
  async function logout() {
    set(userAtom, null)
    await set(userSecureAtom, userSecureDefault)
    set(newUserAtom, newUser)
    set(returningUserAtom, returningUser)
    set(authErrorsAtom, null)
    set(resetPagerAtom)
    set(resetDeviceInfoAtom)

    // Clean chat socket
    const chatSocket = get(chatSocketAtom)
    chatSocket?.disconnect()
    set(chatSocketAtom, null)

    // Clean create post socket
    const createPostSocket = get(createPostSocketAtom)
    createPostSocket?.disconnect()
    set(createPostSocketAtom, null)

    // Clear cookies on web
    if (Platform.OS === "web") {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    }
  }

  if (!showAlert) {
    await logout()
    return
  }

  if (Platform.OS === "web") {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout()
    }
    return
  }

  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Logout",
      style: "destructive",
      onPress: async () => await logout(),
    },
  ])
})

export const requestEmailVerificationAtom = atom(
  null,
  async (get, set, isSignUp: boolean, resending: boolean) => {
    const errors = get(authErrorsAtom)
    const flow = get(flowAtom)
    const returningUser = get(returningUserAtom)

    let email: string

    if (isSignUp) {
      const newUser = get(newUserAtom)
      email = newUser.email
    } else {
      email = returningUser.email
    }

    set(flowAtom, { ...flow, nextEnabled: false })

    const emailSchema = z.email()
    if (!emailSchema.safeParse(email).success) {
      set(authErrorsAtom, {
        ...errors,
        email: "Please enter a valid email address",
      })
      return
    }
    email = email.trim().toLowerCase()

    const currentAttempt = get(emailAttemptsAtom)

    if (currentAttempt && email === currentAttempt[0]) {
      if (isSignUp) {
        set(currPageAtom, 3)
      } else {
        set(currPageAtom, 1)
      }
      return
    }

    set(resendTimerAtom, VERIFICATION_RESEND_TIME) // to immediately disable the resend button
    if (!resending) {
      set(currPageAtom, curr => curr + 1)
    }
    set(incrementAttemptsAtom)
    clearInterval(currentAttempt?.[1])

    const intervalId = setInterval(() => {
      set(resendTimerAtom, prev => {
        if (prev <= 1) {
          if (intervalId) {
            clearInterval(intervalId)
            set(emailAttemptsAtom, null)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    set(emailAttemptsAtom, [email, intervalId])

    try {
      const res = await fetch(`${BASE_URL}/api/auth/request-email-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, isSignUp }),
      })
      const data = await res.json()

      if (!res.ok) {
        set(authErrorsAtom, {
          ...errors,
          email: data.error,
        })
        set(resendTimerAtom, 0)
        setTimeout(() => {
          set(currPageAtom, isSignUp ? 2 : 0)
        }, 500)
        return
      }

      set(authErrorsAtom, { ...errors, email: undefined, emailVerify: undefined })

      if (res.ok && resending) {
        Toast.show({
          type: "info",
          text1: "Verification code sent",
          text2: "Please check your email for the verification code",
          text1Style: { fontSize: 16, fontWeight: "bold" },
          position: "top",
          visibilityTime: 3000,
        })
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        email: "Failed to send verification code",
      })
      setTimeout(() => {
        set(currPageAtom, isSignUp ? 2 : 0)
      }, 500)
    }
  }
)

export const verifyEmailCodeAtom = atom(null, async (get, set, isSignUp: boolean) => {
  const errors = get(authErrorsAtom)
  const flow = get(flowAtom)
  const returningUser = get(returningUserAtom)
  const newUser = get(newUserAtom)

  let email: string, code: string

  if (isSignUp) {
    email = newUser.email
    code = newUser.emailCode
  } else {
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
      body: JSON.stringify({ email, code, isSignUp, platform: Platform.OS }),
      credentials: Platform.OS === "web" ? "include" : "same-origin",
    })
    const data: AuthResponseType = await res.json()

    if (res.ok) {
      if (isSignUp) {
        set(currPageAtom, curr => curr + 1)
        set(newUserAtom, { ...newUser, emailVerified: true })
      } else {
        await set(userSecureAtom, { ...data, isAuthenticated: true })
        set(authErrorsAtom, null)
        set(returningUserAtom, returningUser)
        set(resetPagerAtom)
        set(resetDeviceInfoAtom)

        set(greetAtom, curr => !curr)
        router.replace("/")

        return
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
  set(incrementAttemptsAtom)
})

export const requestPhoneNumberVerificationAtom = atom(
  null,
  async (get, set, resending: boolean) => {
    const newUser = get(newUserAtom)
    const errors = get(authErrorsAtom)
    const flow = get(flowAtom)
    const callingCode = newUser.callingCode
    const phoneNumber = newUser.phoneNumber

    const phoneSchema = z.string().min(9, "Invalid phone number")
    if (!phoneSchema.safeParse(phoneNumber).success) {
      set(authErrorsAtom, {
        ...errors,
        phoneNumber: "Please enter a valid phone number",
      })
      return
    }

    const currentAttempt = get(phoneAttemptsAtom)

    if (currentAttempt && phoneNumber === currentAttempt[0] && !resending) {
      set(currPageAtom, 1)
      return
    }

    set(flowAtom, { ...flow, nextEnabled: false })
    set(resendTimerAtom, VERIFICATION_RESEND_TIME) // to immediately disable the resend button

    try {
      const res = await fetch(`${BASE_URL}/api/auth/request-phone-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callingCode, phoneNumber }),
      })
      const data = await res.json()

      set(incrementAttemptsAtom)

      if (!res.ok) {
        set(authErrorsAtom, {
          ...errors,
          phoneNumber: data.error,
        })
        set(resendTimerAtom, 0)
        return
      }

      if (!resending) {
        set(currPageAtom, curr => curr + 1)
      }
      set(newUserAtom, { ...newUser, phoneCode: "" })
      set(authErrorsAtom, { ...errors, phoneNumber: undefined, phoneVerify: undefined })

      clearInterval(currentAttempt?.[1] || undefined)

      const intervalId = setInterval(() => {
        set(resendTimerAtom, prev => {
          if (prev <= 1) {
            if (intervalId) {
              clearInterval(intervalId)
              set(phoneAttemptsAtom, null)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      set(phoneAttemptsAtom, [phoneNumber, intervalId])

      if (res.ok && resending) {
        Toast.show({
          type: "info",
          text1: "Verification code sent",
          text2: "Please check your phone for the verification code",
          text1Style: { fontSize: 16, fontWeight: "bold" },
          position: "top",
          visibilityTime: 3000,
        })
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        phoneNumber: "Failed to send verification code. Please try again.",
      })
    }
  }
)

export const verifyPhoneNumberVerificationAtom = atom(null, async (get, set) => {
  const newUser = get(newUserAtom)
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

    set(incrementAttemptsAtom)

    if (res.ok) {
      set(currPageAtom, curr => curr + 1)
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
  const newUser = get(newUserAtom)
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
  set(currPageAtom, curr => curr + 1)
})

export const setUserPictureAtom = atom(null, async (get, set, option: "library" | "camera") => {
  const attachments = await set(getAttachmentAtom, true, option, false)
  const newUser = get(newUserAtom)

  if (!attachments) return

  set(newUserAtom, {
    ...newUser,
    picture: attachments[0].uri,
    pictureBlob: attachments[0].file,
    pictureMimeType: attachments[0].mimeType,
  })
})

export const authFetchAtom = atom(
  null,
  async (get, set, url: string, options: FetchRequestInit = {}, noContentType: boolean = false) => {
    // Native flow: rely on secure storage
    function fetchWithToken(token: string) {
      const isFormDataBody = options.body

      return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
          ...(noContentType ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      })
    }

    // Web flow: rely on cookies
    function fetchWithCookies() {
      return fetch(`${BASE_URL}${url}`, {
        ...options,
        credentials: "include",
        headers: {
          ...(noContentType ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
        },
      })
    }

    try {
      const user = await get(userSecureAtom)
      if (!user) {
        set(logOutAtom)
        throw new Error("User is not authenticated")
      }

      if (Platform.OS === "web") {
        let res = await fetchWithCookies()
        if (res.status === 401 || res.status === 403) {
          await set(refreshTokensAtom)

          res = await fetchWithCookies()
          return res
        }
        return res
      } else {
        let res = await fetchWithToken(user.accessToken!)
        if (res.status === 401 || res.status === 403) {
          const token = await set(refreshTokensAtom)

          res = await fetchWithToken(token.accessToken!)
          return res
        }
        return res
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Cannot connect to server. Please check your internet connection and try again.",
      })
      console.error("Auth fetch error:", error)
      throw new Error("Network error")
    }
  }
)

// Refresh the access token using the current auth state from `userSecureAtom`.
// If `user.refreshToken` exists, send it in the request body; otherwise rely on
// cookies for web-based flows.
export const refreshTokensAtom = atom(null, async (get, set) => {
  const opts: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }

  const user = await get(userSecureAtom)

  if (!user) {
    set(logOutAtom)
    throw new Error("User is not authenticated")
  }

  if (user.refreshToken) {
    opts.body = JSON.stringify({ refreshToken: user.refreshToken })
  } else {
    // Ensure cookies are sent for web flows
    opts.credentials = "include"
  }

  const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, opts)

  if (res.status === 401 || res.status === 403) {
    set(logOutAtom)
    throw new Error("Session expired. Please log in again.")
  }

  const token: AuthResponseType = await res.json()

  await set(userSecureAtom, { ...user, ...token })

  return token
})

import * as SecureStore from "expo-secure-store"
import { atom } from "jotai"
import { currPageAtom, flowAtom } from "./pager-store"
import { BLOCK_TIME, MAX_ATTEMPTS } from "../utils/constants"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type DeviceInfoType = {
  blockedUntil: number
  attempts: number // login attempts
}

const DEVICE_INFO_KEY = "device-info"

export const blockedTimerAtom = atom(0)
export const blockedIntervalAtom = atom(0)
export const isBlockedAtom = atom(false)

// Store a singleton device info object in secure storage, which can be used for rate limiting login attempts.
export const getDeviceInfoAtom = atom(null, async (get, set) => {
  let item: string | null

  if (Platform.OS === "web") {
    item = await AsyncStorage.getItem(DEVICE_INFO_KEY)
  } else {
    item = await SecureStore.getItemAsync(DEVICE_INFO_KEY)
  }
  let deviceInfo: DeviceInfoType = item ? JSON.parse(item) : null

  if (!deviceInfo) {
    deviceInfo = {
      blockedUntil: 0,
      attempts: 0,
    }
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo))
    } else {
      await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(deviceInfo))
    }
  }

  return deviceInfo
})

export const incrementAttemptsAtom = atom(null, async (get, set) => {
  const deviceInfo = await set(getDeviceInfoAtom)

  const shouldBlock = await set(checkIfBlockedAtom)
  if (shouldBlock) return

  const updatedDeviceInfo = { ...deviceInfo, blockedUntil: 0, attempts: deviceInfo.attempts + 1 }
  if (Platform.OS === "web") {
    AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(updatedDeviceInfo))
  } else {
    await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(updatedDeviceInfo))
  }
})

export const checkIfBlockedAtom = atom(null, async (get, set) => {
  const deviceInfo = await set(getDeviceInfoAtom)

  let blocking = false

  // Already blocked from previous attempts
  if (deviceInfo.blockedUntil > Date.now()) {
    const remainingTime = Math.ceil((deviceInfo.blockedUntil - Date.now()) / 1000)
    set(blockedTimerAtom, remainingTime)

    blocking = true
  }

  // New block
  if (deviceInfo.attempts >= MAX_ATTEMPTS) {
    const newBlockedUntil = Date.now() + BLOCK_TIME
    const updatedDeviceInfo = { ...deviceInfo, blockedUntil: newBlockedUntil, attempts: 0 }
    if (Platform.OS === "web") {
      AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(updatedDeviceInfo))
    } else {
      await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(updatedDeviceInfo))
    }
    set(blockedTimerAtom, Math.ceil((newBlockedUntil - Date.now()) / 1000))

    blocking = true
  }

  if (blocking) {
    set(flowAtom, prev => ({ ...prev, nextEnabled: false }))
    set(currPageAtom, 0)
    set(isBlockedAtom, true)

    const blockedInterval = get(blockedIntervalAtom)
    if (blockedInterval) {
      clearInterval(blockedInterval)
    }

    const interval = setInterval(() => {
      set(blockedTimerAtom, prev => {
        if (prev <= 1) {
          clearInterval(interval)
          set(flowAtom, prev => ({ ...prev, nextEnabled: true }))
          set(isBlockedAtom, false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    set(blockedIntervalAtom, interval)
    return true
  }

  set(isBlockedAtom, false)
  return false
})

export const resetDeviceInfoAtom = atom(null, async (get, set) => {
  const deviceInfo = {
    blockedUntil: 0,
    attempts: 0,
  }
  if (Platform.OS === "web") {
    return AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo))
  }
  await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(deviceInfo))
})

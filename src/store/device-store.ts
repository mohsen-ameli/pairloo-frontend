import * as SecureStore from "expo-secure-store"
import { atom } from "jotai"
import * as Crypto from "expo-crypto"
import { currPageAtom, flowAtom } from "./pager-store"

// Singleton
export type DeviceInfoType = {
  uuid: string
  blockedUntil: number
  attempts: number // login attempts
} | null

const DEVICE_INFO_KEY = "device-info"
const BLOCK_TIME = 0.5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5

export const blockedTimerAtom = atom(0)
export const blockedIntervalAtom = atom(0)

// Store a singleton device info object in secure storage, which can be used for rate limiting login attempts.
export const getDeviceInfoAtom = atom(null, async (get, set) => {
  const item = await SecureStore.getItemAsync(DEVICE_INFO_KEY)
  let deviceInfo: DeviceInfoType = item ? JSON.parse(item) : null

  if (!deviceInfo) {
    deviceInfo = {
      uuid: Crypto.randomUUID(),
      blockedUntil: 0,
      attempts: 0,
    }
    await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(deviceInfo))
  }

  return deviceInfo
})

export const incrementAttemptsAtom = atom(null, async (get, set) => {
  const deviceInfo = await set(getDeviceInfoAtom)

  const shouldBlock = await set(checkIfBlockedAtom)
  if (shouldBlock) return

  const updatedDeviceInfo = { ...deviceInfo, blockedUntil: 0, attempts: deviceInfo.attempts + 1 }
  await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(updatedDeviceInfo))
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
  if (deviceInfo.attempts === MAX_ATTEMPTS) {
    const newBlockedUntil = Date.now() + BLOCK_TIME
    const updatedDeviceInfo = { ...deviceInfo, blockedUntil: newBlockedUntil, attempts: 0 }
    await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(updatedDeviceInfo))
    set(blockedTimerAtom, Math.ceil((newBlockedUntil - Date.now()) / 1000))

    blocking = true
  }

  if (blocking) {
    set(flowAtom, prev => ({ ...prev, nextEnabled: false }))
    set(currPageAtom, 0)

    const blockedInterval = get(blockedIntervalAtom)
    if (blockedInterval) {
      clearInterval(blockedInterval)
    }

    const interval = setInterval(() => {
      set(blockedTimerAtom, prev => {
        if (prev <= 1) {
          clearInterval(interval)
          set(flowAtom, prev => ({ ...prev, nextEnabled: true }))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    set(blockedIntervalAtom, interval)
    return true
  }

  return false
})

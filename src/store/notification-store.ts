import { Platform } from "react-native"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import Constants from "expo-constants"
import { atom } from "jotai"
import { authFetchAtom, fetchUserInfoAtom, userSecureAtom } from "./auth-store"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})
export const channelsAtom = atom<Notifications.NotificationChannel[]>([])
export const notificationAtom = atom<Notifications.Notification | undefined>(undefined)

export const registerForPushNotificationsAsyncAtom = atom(null, async (get, set) => {
  // Ensure we only warn once per app runtime when running in non-device environments
  // (e.g. emulators) to avoid spamming logs on repeated registration attempts.
  // This is module-scoped and persists until app reload.
  let warnedPhysicalDevice = (global as any).__warnedPhysicalDeviceForPush ?? false
  const setWarned = (v: boolean) => {
    try {
      ;(global as any).__warnedPhysicalDeviceForPush = v
    } catch (_) {}
    warnedPhysicalDevice = v
  }

  let token
  const user = await set(fetchUserInfoAtom)
  if (!user) return

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!")
      return
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
      if (!projectId) {
        throw new Error("Project ID not found")
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data

      const existingToken = user?.expoPushToken

      // If the token has changed (or doesn't exist), update it in the backend and in the user atom
      if (token && token !== existingToken) {
        const res = await set(authFetchAtom, "/api/users/update-expo-push-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expoPushToken: token }),
        })
        const currentUser = await get(userSecureAtom)
        if (!res.ok || !currentUser) {
          throw new Error("Failed to update push token")
        }
        await set(userSecureAtom, { ...currentUser, expoPushToken: token })
      }
    } catch (e) {
      token = `${e}`
    }
  } else {
    if (!warnedPhysicalDevice) {
      console.warn("Must use physical device for push notifications")
      setWarned(true)
    }
  }

  return token
})

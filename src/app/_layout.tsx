import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useAtomValue, useSetAtom } from "jotai"
import { userSecureAtom } from "@/src/store/auth-store"
import { LogBox, Platform } from "react-native"
import { QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { colors } from "@/src/utils/colors"
import { maybeCompleteAuthSession } from "expo-web-browser"
import Toast, { BaseToast, ToastProps } from "react-native-toast-message"
import CustomToast from "@/src/components/CustomToast"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { queryClientAtom } from "@/src/store/general-store"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useEffect, useRef } from "react"
import * as Linking from "expo-linking"
import { usePathname, useRouter } from "expo-router"
import { getDeviceInfoAtom } from "@/src/store/device-store"
import * as Notifications from "expo-notifications"
import {
  channelsAtom,
  notificationAtom,
  registerForPushNotificationsAsyncAtom,
} from "@/src/store/notification-store"
import { useSafeAreaInsets } from "react-native-safe-area-context"
// @ts-ignore: Multi-platform file import
import { setupAds } from "@/src/store/ad-store"

LogBox.ignoreAllLogs()
maybeCompleteAuthSession()

const BetterBaseToast = (props: ToastProps, color: string) => (
  <BaseToast
    {...props}
    text1Style={{ fontSize: 16, fontWeight: "600" }}
    text2Style={{ fontSize: 14, flexWrap: "wrap" }}
    text1NumberOfLines={2}
    text2NumberOfLines={10}
    style={{
      borderLeftColor: color,
      minHeight: props.type === "info" ? 100 : undefined,
      paddingVertical: 6,
    }}
  />
)

const toastConfig = {
  success: (props: ToastProps) => BetterBaseToast(props, colors.successGreen),
  error: (props: ToastProps) => BetterBaseToast(props, colors.errorRed),
  info: (props: ToastProps) => BetterBaseToast(props, colors.blue),
  newMessage: ({
    props,
    onPress,
  }: {
    props: {
      username: string
      message: string
      picture?: string
      Icon?: React.ReactNode
      attachmentUrl?: string
    }
    onPress: () => void
  }) => {
    return <CustomToast {...props} onPress={onPress} />
  },
}

export default function RootLayout() {
  const loginOptions = useCustomHeader({ title: "Log In", includeBottomPadding: true })
  const registerOptions = useCustomHeader({ title: "Create Account", includeBottomPadding: true })
  const forgotEmailOptions = useCustomHeader({ title: "Forgot Email", includeBottomPadding: true })
  const chatOptions = useCustomHeader({ title: "Chat" })
  const myPostOptions = useCustomHeader({ title: "My Post" })
  const postDetailsOptions = useCustomHeader({ title: "Post Details", isPostDetails: true })
  const generalProfileOptions = useCustomHeader({ title: "" })
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  const userJwt = useAtomValue(userSecureAtom)
  const queryClient = useAtomValue(queryClientAtom)
  const getDeviceInfo = useSetAtom(getDeviceInfoAtom)
  const setChannels = useSetAtom(channelsAtom)
  const setNotification = useSetAtom(notificationAtom)
  const registerForPushNotificationsAsync = useSetAtom(registerForPushNotificationsAsyncAtom)
  const hasRegisteredPushRef = useRef(false)
  const notificationListener = useRef<Notifications.EventSubscription>(null)
  const responseListener = useRef<Notifications.EventSubscription>(null)
  const initialHrefRef = useRef<string | null>(
    Platform.OS === "web" ? `${window.location.pathname}${window.location.search}` : null
  )
  const initialHrefHandledRef = useRef(false)

  // Notifications
  useEffect(() => {
    async function setupNotifications() {
      // Guard to make sure only authenticated users can register for push notifications
      if (!userJwt) {
        hasRegisteredPushRef.current = false
        return
      }

      if (hasRegisteredPushRef.current) return
      hasRegisteredPushRef.current = true

      const token = await registerForPushNotificationsAsync()

      if (!token) return

      if (Platform.OS === "android") {
        Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []))
      }
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification)
      })

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        response => {}
      )
    }

    setupNotifications()

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [userJwt])

  useEffect(() => {
    getDeviceInfo()
    setupAds()
  }, [])

  // Deep linking
  useEffect(() => {
    if (Platform.OS === "web") return

    let isMounted = true

    Linking.getInitialURL().then(url => {
      if (!isMounted || !url) return

      const parsed = Linking.parse(url)
      const path = parsed.path ? `/${parsed.path.replace(/^\/+/, "")}` : "/"
      const query = new URLSearchParams()

      Object.entries(parsed.queryParams ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        query.append(key, String(value))
      })

      initialHrefRef.current = query.size ? `${path}?${query.toString()}` : path
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Reroute to initial href
  useEffect(() => {
    if (initialHrefHandledRef.current) return
    if (!userJwt) return

    const initialHref = initialHrefRef.current
    if (!initialHref || initialHref === "/") {
      initialHrefHandledRef.current = true
      return
    }

    if (pathname === "/") {
      initialHrefHandledRef.current = true
      // If we're going to a top level route, just navigate there, otherwise we push to have the "go back" button
      if (initialHref === "/create-post" || initialHref === "/chat" || initialHref === "/profile") {
        router.navigate(initialHref)
      } else {
        router.push(initialHref)
      }
      return
    }

    if (pathname !== "/") {
      initialHrefHandledRef.current = true
    }
  }, [pathname, router, userJwt])

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: colors.light,
      }}
    >
      <StatusBar style="auto" />

      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerBackButtonDisplayMode: "minimal",
              headerTitleStyle: { color: colors.dark },
              headerStyle: { backgroundColor: colors.light },
              headerTintColor: colors.dark,
            }}
          >
            <Stack.Protected guard={userJwt !== null}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(details)/chat-details" options={chatOptions} />
              <Stack.Screen name="(details)/my-post" options={myPostOptions} />
              <Stack.Screen name="(details)/feed-post" options={postDetailsOptions} />
              <Stack.Screen name="(details)/general-profile" options={generalProfileOptions} />
              <Stack.Screen
                name="(details)/review-user"
                options={{
                  presentation: "modal",
                  gestureDirection: "vertical",
                  animation: "default",
                  contentStyle: { backgroundColor: colors.light },
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(util)/map-selector"
                options={{
                  headerShown: false,
                  animation: "fade",
                  contentStyle: { backgroundColor: colors.light },
                }}
              />
              <Stack.Screen
                name="(util)/image-gallery"
                options={{
                  animation: "fade",
                  contentStyle: { backgroundColor: colors.dark },
                  headerShown: false,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={userJwt === null}>
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: colors.light,
                    paddingBottom: insets.bottom,
                  },
                }}
              />
              <Stack.Screen name="(auth)/register" options={registerOptions} />
              <Stack.Screen name="(auth)/login" options={loginOptions} />
              <Stack.Screen name="(auth)/forgot-email" options={forgotEmailOptions} />
            </Stack.Protected>
            <Stack.Screen
              name="(util)/attachment-picker"
              options={{
                presentation: "formSheet",
                gestureDirection: "vertical",
                animation: "slide_from_bottom",
                contentStyle: { backgroundColor: colors.light, paddingBottom: insets.bottom + 20 },
                headerShown: false,
                sheetGrabberVisible: false,
                sheetAllowedDetents: "fitToContents",
                sheetExpandsWhenScrolledToEdge: false,
                sheetElevation: 24,
              }}
            />
            <Stack.Screen
              name="(util)/message-action-modal"
              options={{
                presentation: "formSheet",
                gestureDirection: "vertical",
                animation: "slide_from_bottom",
                contentStyle: { backgroundColor: colors.light },
                headerShown: false,
                sheetGrabberVisible: false,
                sheetInitialDetentIndex: 0,
                sheetAllowedDetents: "fitToContents",
                sheetExpandsWhenScrolledToEdge: false,
                sheetElevation: 24,
              }}
            />
          </Stack>
        </QueryClientProvider>
      </KeyboardProvider>

      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  )
}

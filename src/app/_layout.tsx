import { Stack, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useAtomValue, useSetAtom } from "jotai"
import { userSecureAtom } from "@/src/store/auth-store"
import { Appearance, LogBox, Platform } from "react-native"
import { QueryClientProvider } from "@tanstack/react-query"
import { colors } from "@/src/utils/colors"
import { maybeCompleteAuthSession } from "expo-web-browser"
import Toast, { BaseToast, ToastProps } from "react-native-toast-message"
import CustomToast from "@/src/components/CustomToast"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { queryClientAtom } from "@/src/store/general-store"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useEffect, useRef } from "react"
import { getDeviceInfoAtom } from "@/src/store/device-store"
import * as Linking from "expo-linking"
import * as Notifications from "expo-notifications"
import {
  channelsAtom,
  notificationAtom,
  registerForPushNotificationsAsyncAtom,
} from "@/src/store/notification-store"
import { useSafeAreaInsets } from "react-native-safe-area-context"
// @ts-ignore: Multi-platform file import
import { setupAds } from "@/src/store/ad-store"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { BASE_URL, NODE_ENV } from "@/src/utils/constants"

LogBox.ignoreAllLogs()
maybeCompleteAuthSession()

const colorScheme = Appearance.getColorScheme()

const BetterBaseToast = (props: ToastProps, color: string) => (
  <BaseToast
    {...props}
    text1Style={{ fontSize: 16, fontWeight: "600" }}
    text2Style={{ fontSize: 14, flexWrap: "wrap" }}
    text1NumberOfLines={3}
    text2NumberOfLines={10}
    style={{
      borderLeftColor: color,
      height: props.type === "info" ? 100 : undefined,
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
  const chatOptions = useCustomHeader({ title: "Chat", inChat: true })
  const myPostOptions = useCustomHeader({ title: "My Post" })
  const postDetailsOptions = useCustomHeader({ title: "Post Details", isPostDetails: true })
  const generalProfileOptions = useCustomHeader({ title: "" })
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

  const initialUrlHandled = useRef(false)
  const router = useRouter()

  // Purely for testing purposes to test if we can talk to the backend
  useEffect(() => {
    async function testBackend() {
      if (NODE_ENV === "production") return
      try {
        await fetch(`${BASE_URL}/`)
      } catch (e) {
        const message = `Fetch request to backend failed ${BASE_URL}`
        console.error(message)
        Toast.show({
          type: "error",
          text1: message,
          visibilityTime: Infinity,
        })
      }
    }

    testBackend()
  }, [])

  // Notifications
  useEffect(() => {
    async function setupNotifications() {
      if (Platform.OS === "web") return

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
    async function handleDeepLinks() {
      if (initialUrlHandled.current) return
      const initialUrl = await Linking.getInitialURL()
      if (!initialUrl) return

      // Reset to the root before handling the deep link
      router.replace("/")
      setTimeout(() => {
        const { path, queryParams } = Linking.parse(initialUrl)
        if (path && queryParams) {
          const paths = path.split("/")
          if (paths.length > 1) {
            let currentPath = `/${paths[0]}`
            // Replace the URL with the first route, then loop over the rest, pushing them to the stack
            router.replace(currentPath)
            setTimeout(() => {
              for (let i = 1; i < paths.length; i++) {
                currentPath += `/${paths[i]}`
                router.push({
                  pathname: currentPath,
                  params: queryParams,
                })
              }
            }, 300)
          } else {
            if (path === "chat" || path === "create-post" || path === "profile") {
              router.replace({
                pathname: path,
                params: queryParams,
              })
            } else {
              router.push({
                pathname: path,
                params: queryParams,
              })
            }
          }
        }
      }, 500)
      initialUrlHandled.current = true
    }

    handleDeepLinks()
    getDeviceInfo()
    setupAds()
  }, [])

  if (!userJwt) return null

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
            <Stack.Protected guard={userJwt.isAuthenticated}>
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
            <Stack.Protected guard={!userJwt.isAuthenticated}>
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: colorScheme === "dark" ? "black" : "#A8AAB1",
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
                contentStyle: {
                  backgroundColor: colors.light,
                  paddingBottom: insets.bottom + 20,
                },
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

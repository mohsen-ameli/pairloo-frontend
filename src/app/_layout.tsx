import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useAtomValue, useSetAtom } from "jotai"
import { userSecureAtom } from "@/src/store/auth-store"
import { LogBox, Platform } from "react-native"
import { QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { colors } from "@/src/utils/colors"
import { maybeCompleteAuthSession } from "expo-web-browser"
import Toast from "react-native-toast-message"
import CustomToast from "@/src/components/CustomToast"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { queryClientAtom } from "@/src/store/general-store"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useEffect } from "react"
import { getDeviceInfoAtom } from "@/src/store/device-store"
import * as Notifications from "expo-notifications"
import {
  channelsAtom,
  notificationAtom,
  registerForPushNotificationsAsyncAtom,
} from "@/src/store/notification-store"
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads"
import {
  getTrackingPermissionsAsync,
  PermissionStatus,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency"

LogBox.ignoreAllLogs()
maybeCompleteAuthSession()

const toastConfig = {
  newMessage: ({
    props,
    onPress,
  }: {
    props: {
      username: string
      message: string
      picture?: string
    }
    onPress: () => void
  }) => {
    return <CustomToast {...props} onPress={onPress} />
  },
}

export default function RootLayout() {
  const userJwt = useAtomValue(userSecureAtom)
  const queryClient = useAtomValue(queryClientAtom)

  const loginOptions = useCustomHeader("Log In", true)
  const registerOptions = useCustomHeader("Create Account", true)
  const forgotEmailOptions = useCustomHeader("Forgot Email", true)
  const chatOptions = useCustomHeader("Chat")
  const myPostOptions = useCustomHeader("My Post")
  const defaultOptions = useCustomHeader("", true)
  const getDeviceInfo = useSetAtom(getDeviceInfoAtom)

  const setChannels = useSetAtom(channelsAtom)
  const setNotification = useSetAtom(notificationAtom)
  const registerForPushNotificationsAsync = useSetAtom(registerForPushNotificationsAsyncAtom)

  useEffect(() => {
    // Guard to make sure only authenticated users can register for push notifications
    if (!userJwt) return

    registerForPushNotificationsAsync()

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []))
    }
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification)
    })

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response)
    })

    return () => {
      notificationListener.remove()
      responseListener.remove()
    }
  }, [userJwt])

  async function setupAds() {
    const { status } = await getTrackingPermissionsAsync()
    if (status === PermissionStatus.UNDETERMINED) {
      await requestTrackingPermissionsAsync()
    }

    await mobileAds().setRequestConfiguration({
      // Update all future requests suitable for parental guidance
      maxAdContentRating: MaxAdContentRating.PG,

      // Indicates that you want your content treated as child-directed for purposes of COPPA.
      tagForChildDirectedTreatment: true,

      // Indicates that you want the ad request to be handled in a
      // manner suitable for users under the age of consent.
      tagForUnderAgeOfConsent: true,

      // An array of test device IDs to allow.
      testDeviceIdentifiers: ["EMULATOR"],
    })

    await mobileAds().initialize()
  }

  useEffect(() => {
    getDeviceInfo()
    setupAds()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              <Stack.Screen name="(details)/feed-post" options={defaultOptions} />
              <Stack.Screen name="(details)/profile" options={defaultOptions} />
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
                  presentation: "fullScreenModal",
                  animation: "default",
                  contentStyle: { backgroundColor: colors.light },
                }}
              />
              <Stack.Screen
                name="(util)/image-gallery"
                options={{
                  presentation: "fullScreenModal",
                  animation: "fade",
                  contentStyle: { backgroundColor: colors.dark },
                  headerShown: false,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={userJwt === null}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
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
                contentStyle: { backgroundColor: colors.light },
                headerShown: false,
                sheetGrabberVisible: false,
                sheetInitialDetentIndex: 0,
                sheetAllowedDetents: [0.3],
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

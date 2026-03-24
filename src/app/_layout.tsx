import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useAtomValue } from "jotai"
import { userAtom, userJwtAtom } from "@/src/store/auth-store"
import { LogBox } from "react-native"
import { QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { colors } from "@/src/utils/colors"
import { maybeCompleteAuthSession } from "expo-web-browser"
import Toast from "react-native-toast-message"
import CustomToast from "@/src/components/CustomToast"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { queryClientAtom } from "../store/general-store"
import { GestureHandlerRootView } from "react-native-gesture-handler"

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
  const user = useAtomValue(userAtom)
  const userJwt = useAtomValue(userJwtAtom)
  const queryClient = useAtomValue(queryClientAtom)

  const loginOptions = useCustomHeader("Log In", true)
  const registerOptions = useCustomHeader("Create Account", true)
  const forgotEmailOptions = useCustomHeader("Forgot Email", true)

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
            <Stack.Protected guard={user !== null && userJwt !== null}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(details)" options={{ headerShown: false }} />
              <Stack.Screen
                name="map-selector"
                options={{
                  headerShown: false,
                  presentation: "fullScreenModal",
                  animation: "default",
                  contentStyle: { backgroundColor: colors.light },
                }}
              />
              <Stack.Screen
                name="feed-post"
                options={{
                  presentation: "formSheet",
                  gestureDirection: "vertical",
                  animation: "slide_from_bottom",
                  contentStyle: { backgroundColor: colors.light },
                  headerShown: false,
                  sheetGrabberVisible: true,
                  sheetAllowedDetents: [0.95],
                }}
              />
              <Stack.Screen
                name="image-gallery"
                options={{
                  presentation: "fullScreenModal",
                  animation: "fade",
                  contentStyle: { backgroundColor: colors.dark },
                  headerShown: false,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={user === null || userJwt === null}>
              <Stack.Screen name="landing" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={registerOptions} />
              <Stack.Screen name="login" options={loginOptions} />
              <Stack.Screen name="forgot-email" options={forgotEmailOptions} />
            </Stack.Protected>
            <Stack.Screen
              name="attachment-picker"
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
          </Stack>
        </QueryClientProvider>
      </KeyboardProvider>

      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  )
}

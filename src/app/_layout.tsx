import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useAtomValue } from "jotai"
import { userAtom, userJwtAtom } from "@/src/store/auth-store"
import { LogBox } from "react-native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { colors } from "@/src/utils/colors"
import { maybeCompleteAuthSession } from "expo-web-browser"
import Toast from "react-native-toast-message"
import CustomToast from "@/src/components/CustomToast"
import useCustomHeader from "@/src/utils/useCustomHeader"

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
  const queryClient = new QueryClient()

  const loginOptions = useCustomHeader("Log In", true)
  const registerOptions = useCustomHeader("Create Account", true)
  const forgotEmailOptions = useCustomHeader("Forgot Email", true)

  return (
    <>
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
            </Stack.Protected>
            <Stack.Protected guard={user === null || userJwt === null}>
              <Stack.Screen name="landing" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={registerOptions} />
              <Stack.Screen name="login" options={loginOptions} />
              <Stack.Screen name="forgot-email" options={forgotEmailOptions} />
            </Stack.Protected>
          </Stack>
        </QueryClientProvider>
      </KeyboardProvider>

      <Toast config={toastConfig} />
    </>
  )
}

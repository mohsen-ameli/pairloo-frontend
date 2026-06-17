import { colors } from "@/src/utils/colors"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Layout() {
  const profileOptions = useCustomHeader({ title: "Profile", isProfile: true })
  const settingsOptions = useCustomHeader({ title: "Settings", isSettings: true })
  const insets = useSafeAreaInsets()

  return (
    <Stack>
      <Stack.Screen name="index" options={profileOptions} />
      <Stack.Screen
        name="feedback"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen name="settings" options={settingsOptions} />
      <Stack.Screen
        name="search"
        options={{
          presentation: "modal",
          gestureDirection: "vertical",
          animation: "slide_from_bottom",
          contentStyle: {
            backgroundColor: colors.light,
            paddingBottom: insets.bottom + 20,
          },
          headerShown: false,
        }}
      />
    </Stack>
  )
}

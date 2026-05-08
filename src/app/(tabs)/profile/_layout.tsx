import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function Layout() {
  const profileOptions = useCustomHeader({ title: "Profile", isProfile: true })

  return (
    <Stack>
      <Stack.Screen name="index" options={profileOptions} />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          headerBackVisible: false,
          headerBackButtonMenuEnabled: false,
        }}
      />
    </Stack>
  )
}

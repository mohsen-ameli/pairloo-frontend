import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function Layout() {
  const profileOptions = useCustomHeader({ title: "Profile", isProfile: true })
  const settingsOptions = useCustomHeader({ title: "Settings", isSettings: true })
  const searchOptions = useCustomHeader({ title: "" })

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
      <Stack.Screen name="search" options={searchOptions} />
    </Stack>
  )
}

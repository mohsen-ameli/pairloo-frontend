import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function Layout() {
  const profileOptions = useCustomHeader({ title: "Profile", isProfile: true })
  const settingsOptions = useCustomHeader({ title: "Settings" })

  return (
    <Stack>
      <Stack.Screen name="index" options={profileOptions} />
      <Stack.Screen name="settings" options={settingsOptions} />
    </Stack>
  )
}

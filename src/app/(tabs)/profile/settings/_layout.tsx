import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function Layout() {
  const settingsOptions = useCustomHeader({ title: "Settings" })

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          ...settingsOptions,
          presentation: "fullScreenModal",
          gestureDirection: "vertical",
          animation: "default",
        }}
      />
    </Stack>
  )
}

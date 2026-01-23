import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function Layout() {
  const indexOptions = useCustomHeader("My Posts")

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
    </Stack>
  )
}

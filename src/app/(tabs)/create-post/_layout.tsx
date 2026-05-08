import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function Layout() {
  const indexOptions = useCustomHeader({ title: "Create Post", createPost: true })

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
    </Stack>
  )
}

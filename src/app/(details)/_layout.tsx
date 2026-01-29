import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function DetailsLayout() {
  const chatOptions = useCustomHeader("Chat")
  const feedOptions = useCustomHeader("Post")
  const myPostOptions = useCustomHeader("My Post")

  return (
    <Stack>
      <Stack.Screen name="chat-details" options={chatOptions} />
      <Stack.Screen name="feed-post" options={feedOptions} />
      <Stack.Screen name="my-post" options={myPostOptions} />
    </Stack>
  )
}

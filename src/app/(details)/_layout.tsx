import { colors } from "@/src/utils/colors"
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
  )
}

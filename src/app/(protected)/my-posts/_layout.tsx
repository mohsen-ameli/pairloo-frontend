import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "My Posts" }} />
      <Stack.Screen name="[id]" options={{ title: "Post" }} />
    </Stack>
  );
}

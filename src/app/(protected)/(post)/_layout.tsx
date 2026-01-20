import useCustomHeader from "@/src/utils/useCustomHeader";
import { Stack } from "expo-router";

export default function Layout() {
  const indexOptions = useCustomHeader("Home");
  const detailOptions = useCustomHeader("Post Details");

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen name="[id]" options={detailOptions} />
    </Stack>
  );
}

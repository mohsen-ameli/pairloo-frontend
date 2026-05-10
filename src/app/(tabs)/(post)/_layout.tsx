import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"

export default function Layout() {
  const indexOptions = useCustomHeader({ title: "Pairloo", isHome: true })
  const searchOptions = useCustomHeader({ title: "" })

  return (
    <Stack>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen name="search" options={searchOptions} />
    </Stack>
  )
}

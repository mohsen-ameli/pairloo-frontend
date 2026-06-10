import { useSharedValue } from "react-native-reanimated"
import { useKeyboardHandler } from "react-native-keyboard-controller"
import { TAB_HEIGHT } from "./constants"
import { Platform } from "react-native"

export default function useGradualAnimation({ includeTabHeight }: { includeTabHeight: boolean }) {
  const height = useSharedValue(0)
  const tabHeight = includeTabHeight ? TAB_HEIGHT : 0
  const extraSpace = Platform.OS === "android" ? 24 : 0

  useKeyboardHandler({
    onMove: e => {
      "worklet"
      height.value = Math.max(e.height - tabHeight - extraSpace, 0)
    },
    onEnd: e => {
      "worklet"
      height.value = Math.max(e.height - tabHeight - extraSpace, 0)
    },
  })

  return { height }
}

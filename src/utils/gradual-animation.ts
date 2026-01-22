import { useSharedValue } from "react-native-reanimated"
import { useKeyboardHandler } from "react-native-keyboard-controller"
import { TAB_HEIGHT } from "./constants"

export default function useGradualAnimation({ includeTabHeight }: { includeTabHeight: boolean }) {
  const height = useSharedValue(0)
  const tab_height = includeTabHeight ? TAB_HEIGHT : 0

  useKeyboardHandler({
    onMove: e => {
      "worklet"
      height.value = Math.max(e.height - tab_height, 0)
    },
    onEnd: e => {
      "worklet"
      height.value = Math.max(e.height - tab_height, 0)
    },
  })
  return { height }
}

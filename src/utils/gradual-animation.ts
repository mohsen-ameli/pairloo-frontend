import { useEffect } from "react"
import { Keyboard, Platform } from "react-native"
import { useSharedValue, withTiming } from "react-native-reanimated"
import { TAB_HEIGHT } from "./constants"

const KEYBOARD_CLEARANCE = 24

export default function useGradualAnimation({ includeTabHeight }: { includeTabHeight: boolean }) {
  const height = useSharedValue(0)
  const tab_height = includeTabHeight ? TAB_HEIGHT : 0

  useEffect(() => {
    if (Platform.OS === "web") return

    const setHeight = (keyboardHeight: number) => {
      height.value = withTiming(Math.max(keyboardHeight - tab_height + KEYBOARD_CLEARANCE, 0), {
        duration: 100,
      })
    }

    const showSubscription = Keyboard.addListener("keyboardDidShow", event => {
      setHeight(event.endCoordinates.height)
    })

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setHeight(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [height, tab_height])

  return { height }
}

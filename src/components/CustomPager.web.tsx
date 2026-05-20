import { ReactNode, useRef, useState } from "react"
import { Animated as A, Alert, Keyboard, Pressable, Text, View } from "react-native"
import { colors } from "@/src/utils/colors"
import { useAtomValue } from "jotai"
import useGradualAnimation from "@/src/utils/gradual-animation"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { currPageAtom, flowAtom, pageCountAtom } from "@/src/store/pager-store"
import { userAtom } from "@/src/store/auth-store"
import CustomButton from "./CustomButton"
import { commonStyles } from "../styles/common.styles"

export default function CustomPager({ children }: { children: ReactNode }) {
  const pageCount = useAtomValue(pageCountAtom)
  const scrollOffset = useRef(new A.Value(0)).current
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const currPage = useAtomValue(currPageAtom)
  const flow = useAtomValue(flowAtom)
  const isAuthenticated = useAtomValue(userAtom) !== null
  const { height } = useGradualAnimation({ includeTabHeight: isAuthenticated })

  const flowButtons = useAnimatedStyle(() => {
    return {
      bottom: height.value + 10,
    }
  }, [isAuthenticated])

  return (
    <View style={commonStyles.generalContainer}>
      <View style={commonStyles.container}>{children}</View>

      <Animated.View
        style={[
          flowButtons,
          {
            position: "absolute",
            right: 20,
            borderRadius: "50%",
            zIndex: 1,
          },
        ]}
      >
        <Pressable
          style={{
            width: 70,
            height: 70,
            marginLeft: "auto",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.purple,
            opacity: flow.nextEnabled ? 1 : 0.5,
            borderRadius: "50%",
          }}
          onPress={async () => {
            console.log("pressed")
            Keyboard.dismiss()
            await new Promise(resolve => setTimeout(resolve, 100))
            flow.next && flow.next()
          }}
          disabled={!flow.nextEnabled}
        >
          <Text
            style={{
              color: colors.light,
              fontSize: 16,
            }}
          >
            Next
          </Text>
        </Pressable>
      </Animated.View>

      {/* Back Button */}
      {currPage > 0 && (
        <Animated.View
          style={[
            flowButtons,
            {
              position: "absolute",
              left: 20,
              borderRadius: "50%",
              zIndex: 1,
            },
          ]}
        >
          <Pressable
            style={{
              width: 70,
              height: 70,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.purple,
              borderRadius: "50%",
            }}
            onPress={async () => {
              Keyboard.dismiss()
              await new Promise(resolve => setTimeout(resolve, 100))
              flow.back && flow.back()
            }}
          >
            <Text
              style={{
                color: colors.light,
                fontSize: 16,
              }}
            >
              Back
            </Text>
            {/* <Feather name="arrow-left" size={30} color={colors.light} /> */}
          </Pressable>
        </Animated.View>
      )}
    </View>
  )
}

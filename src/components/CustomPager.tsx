import { Children, ReactNode, useEffect, useState } from "react"
import { Keyboard, Pressable, Text, View } from "react-native"
import { colors, isWeb } from "@/src/utils/colors"
import { useAtomValue } from "jotai"
import useGradualAnimation from "@/src/utils/gradual-animation"
import { currPageAtom, flowAtom, pageCountAtom } from "@/src/store/pager-store"
import { userAtom } from "@/src/store/auth-store"
import { commonStyles } from "@/src/styles/common.styles"
import Animated, {
  Extrapolation,
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

export default function CustomPager({ children }: { children: ReactNode }) {
  const pageCount = useAtomValue(pageCountAtom)
  const pages = Children.toArray(children)
  const scrollOffset = useSharedValue(0)
  const translateX = useSharedValue(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [xPos, setXPos] = useState(0)
  const currPage = useAtomValue(currPageAtom)
  const flow = useAtomValue(flowAtom)
  const isAuthenticated = useAtomValue(userAtom) !== null
  const { height } = useGradualAnimation({ includeTabHeight: isAuthenticated })

  useEffect(() => {
    if (!containerWidth) return

    translateX.value = withTiming(-currPage * containerWidth - 10, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    })

    scrollOffset.value = withTiming(currPage, {
      duration: 100,
    })
  }, [containerWidth, currPage])

  const pagesAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const flowButtons = useAnimatedStyle(() => {
    return {
      bottom: height.value + 10,
    }
  }, [])

  return (
    <View style={commonStyles.generalContainer}>
      {/* Dots */}
      <View
        style={{
          position: "absolute",
          top: 30,
          alignSelf: "center",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {[...Array(pageCount)].map((_, i) => (
            <PagerDot key={i} index={i} scrollOffset={scrollOffset} />
          ))}
        </View>
      </View>

      {/* Pages */}
      <View
        style={[commonStyles.container, { flex: 1, overflow: "hidden", paddingVertical: 0 }]}
        onLayout={event => {
          const width = event.nativeEvent.layout.width
          setContainerWidth(width)
          const x = event.nativeEvent.layout.x
          setXPos(x)
        }}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              flexDirection: "row",
              width: containerWidth ? containerWidth * pages.length : "100%",
            },
            pagesAnimation,
          ]}
        >
          {pages.map((page, index) => (
            <View key={index} style={{ flex: 1 }}>
              {page}
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Next button */}
      <Animated.View
        style={
          isWeb
            ? [
                {
                  position: "absolute",
                  right: xPos - 100,
                  top: "50%",
                  borderRadius: "50%",
                  userSelect: "none",
                },
              ]
            : [
                flowButtons,
                {
                  position: "absolute",
                  right: 20,
                  borderRadius: "50%",
                  zIndex: 1,
                },
              ]
        }
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
          style={
            isWeb
              ? [
                  {
                    position: "absolute",
                    left: xPos - 100,
                    top: "50%",
                    borderRadius: "50%",
                    userSelect: "none",
                  },
                ]
              : [
                  flowButtons,
                  {
                    position: "absolute",
                    left: 20,
                    borderRadius: "50%",
                    zIndex: 1,
                  },
                ]
          }
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
          </Pressable>
        </Animated.View>
      )}
    </View>
  )
}

function PagerDot({ index, scrollOffset }: { index: number; scrollOffset: SharedValue<number> }) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1]

    return {
      transform: [
        {
          scale: interpolate(scrollOffset.value, inputRange, [1, 1.75, 1], Extrapolation.CLAMP),
        },
      ],
      opacity: interpolate(scrollOffset.value, inputRange, [0.5, 1, 0.5], Extrapolation.CLAMP),
    }
  })

  return (
    <Animated.View
      style={[
        {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: colors.purple,
          marginHorizontal: 2,
        },
        dotStyle,
      ]}
    />
  )
}

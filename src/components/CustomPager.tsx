import { useCallback, useEffect, useRef, useState } from "react"
import { Animated as A, Platform, Pressable, Text, View } from "react-native"
import PagerView, { usePagerView } from "react-native-pager-view"
import { colors } from "@/src/utils/colors"
import { useAtom, useAtomValue } from "jotai"
import useGradualAnimation from "@/src/utils/gradual-animation"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { currPageAtom, flowAtom, pageCountAtom } from "@/src/store/pager-store"
import { userAtom } from "@/src/store/auth-store"
import { useFocusEffect } from "expo-router"

/**
 * Allows for creating a pager with multiple pages, navigation dots, and next/back buttons.
 * You can also set the page count dynamically.
 */
export default function CustomPager({
  initialPageCount,
  children,
}: {
  initialPageCount: number
  children: React.ReactNode
}) {
  const [pageCount, setPageCount] = useAtom(pageCountAtom)
  const scrollOffset = useRef(new A.Value(0)).current
  const { setPage, ref } = usePagerView({ pagesAmount: pageCount })
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const isAuthenticated = useAtomValue(userAtom) !== null
  const { height } = useGradualAnimation({ isAuthenticated })

  useFocusEffect(
    useCallback(() => {
      return () => {
        setCurrPage(0)
        setPageCount(initialPageCount)
        setFlow({
          back: null,
          next: null,
          backEnabled: true,
          nextEnabled: true,
        })
      }
    }, [])
  )

  useEffect(() => {
    setPageCount(initialPageCount)
  }, [initialPageCount])

  // Animate scrollOffset when currPage changes (for dots)
  useEffect(() => {
    setPage(currPage)

    A.timing(scrollOffset, {
      toValue: currPage,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }, [currPage])

  // Animate fake view height
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    }
  }, [])

  // Animate next/back (flow) buttons position
  const flowButtons = useAnimatedStyle(() => {
    return {
      bottom: height.value + (Platform.OS === "ios" ? 10 : 20),
    }
  }, [])

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {/* Dots */}
      <View
        style={{
          position: "absolute",
          top: 0,
          paddingTop: 25,
          paddingBottom: 10,
          width: "100%",
          zIndex: 1,
          backgroundColor: colors.light,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {[...Array(pageCount)].map((_, i) => {
            const inputRange = [i - 1, i, i + 1]
            const scale = scrollOffset.interpolate({
              inputRange,
              outputRange: [1, 1.75, 1],
              extrapolate: "clamp",
            })
            const opacity = scrollOffset.interpolate({
              inputRange,
              outputRange: [0.5, 1, 0.5],
              extrapolate: "clamp",
            })
            return (
              <A.View
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.purple,
                  marginHorizontal: 2,
                  transform: [{ scale }],
                  opacity,
                }}
              />
            )
          })}
        </View>
      </View>

      {/* Pages */}
      <PagerView
        ref={ref}
        style={{ flex: 1, backgroundColor: colors.light }}
        initialPage={currPage}
        scrollEnabled={scrollEnabled}
        onLayout={() => setScrollEnabled(false)} // needed for ios
      >
        {children}
      </PagerView>

      {/* Next Button */}
      <Animated.View
        style={[
          flowButtons,
          {
            position: "absolute",
            right: 20,
            backgroundColor: colors.light,
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
            backgroundColor: !flow.nextEnabled ? colors.gray : colors.purple,
            borderRadius: "50%",
          }}
          onPress={() => {
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
              backgroundColor: colors.light,
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
              backgroundColor: !flow.backEnabled ? colors.gray : colors.purple,
              borderRadius: "50%",
            }}
            onPress={() => {
              flow.back && flow.back()
            }}
            disabled={!flow.backEnabled}
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

      {/* To push the content up when keyboard is visible */}
      <Animated.View style={[fakeView, { backgroundColor: colors.light }]} />
    </View>
  )
}

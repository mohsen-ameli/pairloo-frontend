import { useCallback, useEffect, useRef, useState } from "react";
import { Animated as A, Pressable, Text, View } from "react-native";
import PagerView, { usePagerView } from "react-native-pager-view";
import { colors } from "../utils/colors";
import { atom, useAtom, useAtomValue } from "jotai";
import useGradualAnimation from "../utils/gradual-animation";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const currPageAtom = atom(0);
// Use this to configure what the next and back buttons do
// And whether they are disabled
export const flowAtom = atom({
  back: null as null | (() => void),
  next: null as null | (() => void),
  backEnabled: true,
  nextEnabled: true,
});

/**
 * Allows for creating a pager with multiple pages, navigation dots, and next/back buttons.
 * You can also set the page count dynamically.
 * NOTE: When using setCurrPage, use setPage alongside it to sync the pager view.
 */
export default function useCustomPager({
  initialPageCount,
}: {
  initialPageCount: number;
}) {
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [currPage, setCurrPage] = useAtom(currPageAtom);
  const scrollOffset = useRef(new A.Value(0)).current;
  const { AnimatedPagerView, ref, setPage, activePage, ...rest } = usePagerView(
    {
      pagesAmount: pageCount,
    }
  );

  // Animate scrollOffset when currPage changes (for dots)
  useEffect(() => {
    A.timing(scrollOffset, {
      toValue: currPage,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [currPage]);

  const Pager = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      const [scrollEnabled, setScrollEnabled] = useState(true);
      const [currPage, setCurrPage] = useAtom(currPageAtom);
      const flow = useAtomValue(flowAtom);
      const { height } = useGradualAnimation();

      // Animate fake view height
      const fakeView = useAnimatedStyle(() => {
        return {
          height: Math.abs(height.value),
        };
      }, []);

      // Animate next/back (flow) buttons position
      const flowButtons = useAnimatedStyle(() => {
        return {
          bottom: height.value + 10,
        };
      }, []);

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
                const inputRange = [i - 1, i, i + 1];
                const scale = scrollOffset.interpolate({
                  inputRange,
                  outputRange: [1, 1.75, 1],
                  extrapolate: "clamp",
                });
                const opacity = scrollOffset.interpolate({
                  inputRange,
                  outputRange: [0.5, 1, 0.5],
                  extrapolate: "clamp",
                });
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
                );
              })}
            </View>
          </View>

          {/* Pages */}
          <PagerView
            ref={ref}
            style={{ flex: 1, backgroundColor: colors.light }}
            initialPage={currPage}
            scrollEnabled={scrollEnabled}
            onLayout={() => setScrollEnabled(false)}
            onPageSelected={(e) => {
              const position = e.nativeEvent.position;
              setCurrPage(position);
            }}
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
                backgroundColor: !flow.nextEnabled
                  ? colors.gray
                  : colors.purple,
                borderRadius: "50%",
              }}
              onPress={() => {
                flow.next && flow.next();
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
                  backgroundColor: !flow.backEnabled
                    ? colors.gray
                    : colors.purple,
                  borderRadius: "50%",
                }}
                onPress={() => {
                  flow.back && flow.back();
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

          <Animated.View
            style={[fakeView, { backgroundColor: colors.light }]}
          />
        </View>
      );
    },
    [pageCount, currPage]
  );

  return { currPage, setCurrPage, setPage, setPageCount, Pager };
}

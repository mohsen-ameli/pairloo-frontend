import { useCallback, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import PagerView, { usePagerView } from "react-native-pager-view";
import { colors } from "../utils/colors";
import { atom, useAtom, useSetAtom } from "jotai";

const currPageAtom = atom(0);

export default function useCustomPager({ pageCount }: { pageCount: number }) {
  const setCurrPage = useSetAtom(currPageAtom);
  const scrollOffset = useRef(new Animated.Value(0)).current;
  const { AnimatedPagerView, ref, setPage, activePage, ...rest } = usePagerView(
    {
      pagesAmount: pageCount,
    }
  );

  const Pager = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      const [currPage, setCurrPage] = useAtom(currPageAtom);

      return (
        <>
          {/* Dots */}
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: 30,
              width: "95%",
              zIndex: 1,
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
                  <Animated.View
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

          {/* Forward and Backward */}
          <View
            style={{
              position: "absolute",
              bottom: 50,
              left: 20,
              right: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              zIndex: 1,
            }}
          >
            {currPage > 0 ? (
              <Pressable
                style={{
                  width: 70,
                  height: 70,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.purple,
                  borderRadius: "50%",
                }}
                onPress={() => {
                  setCurrPage(currPage - 1);
                  setPage(currPage - 1);
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
            ) : (
              <View />
            )}
            {currPage < pageCount - 1 ? (
              <Pressable
                style={{
                  width: 70,
                  height: 70,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.purple,
                  borderRadius: "50%",
                }}
                onPress={() => {
                  setCurrPage(currPage + 1);
                  setPage(currPage + 1);
                }}
              >
                <Text
                  style={{
                    color: colors.light,
                    fontSize: 16,
                  }}
                >
                  Next
                </Text>
                {/* <Feather name="arrow-right" size={30} color={colors.light} /> */}
              </Pressable>
            ) : (
              <View />
            )}
          </View>

          {/* Pages */}
          <PagerView
            ref={ref}
            style={{ flex: 1, backgroundColor: colors.light }}
            initialPage={0}
            onPageScroll={(e) => {
              // e.nativeEvent.offset is 0-1 between pages, position is the left page index
              const position = e.nativeEvent.position;
              const offset = e.nativeEvent.offset;
              // Animate scrollOffset to current page + offset
              Animated.timing(scrollOffset, {
                toValue: position + offset,
                duration: 0,
                useNativeDriver: false,
              }).start();
            }}
            onPageSelected={(e) => {
              setCurrPage(e.nativeEvent.position);
            }}
          >
            {children}
          </PagerView>
        </>
      );
    },
    [pageCount]
  );

  return { setCurrPage, setPage, Pager };
}

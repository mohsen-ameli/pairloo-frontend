import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import PagerView, { usePagerView } from "react-native-pager-view";
import { colors } from "../utils/colors";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

const currPageAtom = atom(0);
const locksAtom = atom<boolean[]>([]);

/**
 * Allows for creating a pager with multiple pages, navigation dots, and next/back buttons.
 * You can pass a locks param to lock certain pages from being accessed until unlocked.
 * You can also set the page count dynamically.
 * NOTE: When using setCurrPage, use setPage to sync the pager view.
 */
export default function useCustomPager({
  initialPageCount,
  pageLocks,
  forwardNBackwardButtons = true,
  scrollEnabled = true,
}: {
  initialPageCount: number;
  pageLocks?: boolean[];
  forwardNBackwardButtons?: boolean;
  scrollEnabled?: boolean;
}) {
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [currPage, setCurrPage] = useAtom(currPageAtom);
  const setLocks = useSetAtom(locksAtom);
  const scrollOffset = useRef(new Animated.Value(0)).current;
  const { AnimatedPagerView, ref, setPage, activePage, ...rest } = usePagerView(
    {
      pagesAmount: pageCount,
    }
  );

  useEffect(() => {
    if (pageLocks) {
      setLocks(pageLocks);
    }
  }, []);

  // Animate scrollOffset when currPage changes (for dots)
  useEffect(() => {
    Animated.timing(scrollOffset, {
      toValue: currPage,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [currPage]);

  const Pager = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      const [currPage, setCurrPage] = useAtom(currPageAtom);
      const locks = useAtomValue(locksAtom);

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
          {forwardNBackwardButtons && (
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
              {currPage < pageCount - 1 && !locks[currPage + 1] ? (
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
          )}

          {/* Pages */}
          <PagerView
            ref={ref}
            style={{ flex: 1, backgroundColor: colors.light }}
            initialPage={currPage}
            scrollEnabled={scrollEnabled}
            onPageScroll={(e) => {
              // e.nativeEvent.offset is 0-1 between pages, position is the left page index
              const position = e.nativeEvent.position;
              const offset = e.nativeEvent.offset;

              if (locks[position]) {
                // If the current page is locked, prevent scrolling forward
                setPage(position - 1);
                return;
              }
              if (locks[position + 1]) {
                // If the next page is locked and user is trying to scroll to it, prevent scrolling
                setPage(position);
                return;
              }

              // Animate scrollOffset to current page + offset
              Animated.timing(scrollOffset, {
                toValue: position + offset,
                duration: 0,
                useNativeDriver: true,
              }).start();
            }}
            onPageSelected={(e) => {
              const position = e.nativeEvent.position;

              if (locks[position]) {
                // If the selected page is locked, revert to previous page
                setPage(currPage);
                return;
              }
              setCurrPage(position);
            }}
          >
            {children}
          </PagerView>
        </>
      );
    },
    [pageCount, currPage]
  );

  return { currPage, setCurrPage, setPage, setLocks, setPageCount, Pager };
}

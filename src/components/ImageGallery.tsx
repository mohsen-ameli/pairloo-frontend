import React, { useState, useCallback, useRef } from "react"
import {
  useWindowDimensions,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  type ViewStyle,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
} from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { Image } from "expo-image"
import Zoom from "react-native-zoom-reanimated"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { bigImageViewAtom, imgIndexAtom, visibleAtom } from "@/src/store/chat-store"
import { chatStyles } from "../styles/chat.styles"
import { colors } from "../utils/colors"

/**
 * Image item interface for gallery
 */
export interface ImageItem {
  id: string
  uri: string
}

/**
 * Props for ImageGallery component
 */
export interface ImageGalleryProps {
  isDarkMode?: boolean
  showTitles?: boolean
  doubleTapScale?: number
  minZoomScale?: number
  maxZoomScale?: number
  containerStyle?: ViewStyle
  /**
   * Gap between images in the gallery (Apple Photos style).
   * Creates black spacing between images while swiping.
   * Default is 20.
   */
  imageGap?: number
}

/**
 * Props for individual gallery image item
 */
interface GalleryImageItemProps {
  item: ImageItem
  index: number
  deviceWidth: number
  deviceHeight: number
  isDarkMode: boolean
  doubleTapScale: number
  minZoomScale: number
  maxZoomScale: number
  flatListRef: React.RefObject<FlatList<ImageItem> | null>
  imageGap: number
  itemWidth: number
}

/**
 * Individual image item component for the gallery
 */
function GalleryImageItem({
  item,
  index,
  deviceWidth,
  deviceHeight,
  isDarkMode,
  doubleTapScale,
  minZoomScale,
  maxZoomScale,
  flatListRef,
  imageGap,
  itemWidth,
}: GalleryImageItemProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Item container includes gap, but image displays at deviceWidth
  return (
    <View style={[styles.imageContainer, { width: itemWidth, height: deviceHeight }]}>
      <Zoom
        style={[
          styles.zoomContainer,
          { width: deviceWidth, height: deviceHeight, marginRight: imageGap },
        ]}
        doubleTapConfig={{
          defaultScale: doubleTapScale,
          minZoomScale,
          maxZoomScale,
        }}
        enableGallerySwipe
        parentScrollRef={flatListRef}
        currentIndex={index}
        itemWidth={itemWidth}
      >
        <Image
          source={{ uri: item.uri }}
          contentFit="contain"
          style={{
            width: deviceWidth,
            height: deviceHeight,
          }}
          onLoadStart={() => {
            setIsLoading(true)
            setHasError(false)
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      </Zoom>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      )}
      {hasError && (
        <View style={styles.loadingOverlay}>
          <Text style={[styles.errorText, { color: colors.errorRed }]}>Failed to load image</Text>
        </View>
      )}
    </View>
  )
}

export default function ImageGallery({
  isDarkMode = false,
  doubleTapScale = 2,
  minZoomScale = 1,
  maxZoomScale = 5,
  containerStyle,
  imageGap = 20,
}: ImageGalleryProps): React.JSX.Element {
  const { width: deviceWidth } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useAtom(imgIndexAtom)
  const [containerHeight, setContainerHeight] = useState(0)
  const flatListRef = useRef<FlatList<ImageItem> | null>(null)
  const images = useAtomValue(bigImageViewAtom)
  const setIsVisible = useSetAtom(visibleAtom)

  // Item width includes gap for proper snapping
  const itemWidth = deviceWidth + imageGap

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height)
  }, [])

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / itemWidth)
    if (index !== currentIndex && index >= 0 && index < images.length) setCurrentIndex(index)
  }

  return (
    <View style={[styles.container, containerStyle]} onLayout={handleLayout}>
      {containerHeight > 0 && (
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={({ item, index }) => (
            <GalleryImageItem
              item={item}
              index={index}
              deviceWidth={deviceWidth}
              deviceHeight={containerHeight}
              isDarkMode={isDarkMode}
              doubleTapScale={doubleTapScale}
              minZoomScale={minZoomScale}
              maxZoomScale={maxZoomScale}
              flatListRef={flatListRef}
              imageGap={imageGap}
              itemWidth={itemWidth}
            />
          )}
          getItemLayout={(_, index) => ({
            length: itemWidth,
            offset: itemWidth * index,
            index,
          })}
          initialScrollIndex={currentIndex}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.flatList}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: imageGap }}
        />
      )}

      {/* Footer */}
      {images.length > 1 && (
        <View style={chatStyles.imageFooter}>
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.uri}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setCurrentIndex(parseInt(item.id))
                  flatListRef.current?.scrollToIndex({ index: parseInt(item.id), animated: false })
                }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: 30,
                    height: 60,
                    borderRadius: 4,
                    marginHorizontal: parseInt(item.id) === currentIndex ? 10 : 1,
                    opacity: parseInt(item.id) === currentIndex ? 1 : 0.5,
                  }}
                  allowDownscaling
                />
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  flatList: {
    flex: 1,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
  },
  zoomContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  pageIndicator: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pageIndicatorText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  pageTitleText: {
    fontSize: 11,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 2,
  },
})

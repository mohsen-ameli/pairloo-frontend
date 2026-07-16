import React, { useState, useCallback, useRef, useEffect } from "react"
import {
  useWindowDimensions,
  View,
  Text,
  ActivityIndicator,
  type ViewStyle,
  type LayoutChangeEvent,
  Pressable,
  TouchableOpacity,
  Platform,
} from "react-native"
import { Image } from "expo-image"
import Zoom from "react-native-zoom-reanimated"
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { bigImageViewAtom, imgIndexAtom } from "@/src/store/chat-store"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useRouter } from "expo-router"
import { FlashList, FlashListRef } from "@shopify/flash-list"
import * as MediaLibrary from "expo-media-library"
import { Directory, File, Paths } from "expo-file-system"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { styles } from "@/src/styles/image-gallery.styles"
import Toast from "react-native-toast-message"
import DropdownMenu, { DropdownMenuAction } from "@/src/components/DropdownMenu"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"

const isZoomedAtom = atom(false)

export default function ImageGallery({
  doubleTapScale = 2,
  minZoomScale = 1,
  maxZoomScale = 5,
  imageGap = 20,
}: {
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
}) {
  const { width: deviceWidth } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useAtom(imgIndexAtom)
  const [containerHeight, setContainerHeight] = useState(0)
  const flashListRef = useRef<FlashListRef<string> | null>(null)
  const images = useAtomValue(bigImageViewAtom)
  const isZoomed = useAtomValue(isZoomedAtom)
  const router = useRouter()

  // Item width includes gap for proper snapping
  const itemWidth = deviceWidth + imageGap

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height)
  }, [])

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / itemWidth)
    if (index !== currentIndex && index >= 0 && index < images.length) setCurrentIndex(index)
  }

  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (images.length === 0) {
      router.back()
    }
  }, [images, router])

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Header */}
      {!isZoomed && (
        <View style={[styles.imageHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.imageHeaderButton} onPress={() => router.back()}>
            <Feather name="x" size={25} color={colors.dark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageHeaderButton}>
            <Menu />
          </TouchableOpacity>
        </View>
      )}

      {/* Gallery */}
      {containerHeight > 0 && (
        <FlashList
          ref={flashListRef}
          data={images}
          renderItem={({ item, index }) => (
            <GalleryImageItem
              item={item}
              index={index}
              deviceWidth={deviceWidth}
              deviceHeight={containerHeight}
              doubleTapScale={doubleTapScale}
              minZoomScale={minZoomScale}
              maxZoomScale={maxZoomScale}
              flashListRef={flashListRef}
              imageGap={index === images.length - 1 ? 0 : imageGap}
              itemWidth={index === images.length - 1 ? deviceWidth : itemWidth}
            />
          )}
          initialScrollIndex={currentIndex}
          keyExtractor={item => item}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.galleryList}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={itemWidth}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      )}

      {/* Footer */}
      {images.length > 1 && !isZoomed && (
        <View style={styles.imageFooter}>
          <FlashList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => {
                  setCurrentIndex(index)
                  flashListRef.current?.scrollToIndex({ index: index, animated: false })
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width: 30,
                    height: 60,
                    borderRadius: 4,
                    marginHorizontal: index === currentIndex ? 10 : 1,
                    opacity: index === currentIndex ? 1 : 0.5,
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

function Menu() {
  const images = useAtomValue(bigImageViewAtom)
  const currentIndex = useAtomValue(imgIndexAtom)
  const menuRef = useRef(null)
  const [actions, setActions] = useState<DropdownMenuAction[]>([])

  useEffect(() => {
    const baseActions: DropdownMenuAction[] = [
      {
        id: "save",
        title: "Save",
        titleColor: colors.dark,
        icon: <Feather name="save" size={18} color={colors.dark} />,
      },
      {
        id: "report",
        title: "Report",
        titleColor: colors.dark,
        icon: <Feather name="flag" size={18} color={colors.dark} />,
      },
    ]
    if (images.length > 1) {
      setActions(() => {
        const newActions = [...baseActions]
        newActions.splice(1, 0, {
          id: "saveAll",
          title: "Save All",
          titleColor: colors.dark,
          icon: (
            <MaterialCommunityIcons name="content-save-all-outline" size={18} color={colors.dark} />
          ),
        })
        return newActions
      })
    } else {
      setActions(baseActions)
    }
  }, [images])

  async function saveImage(index: number) {
    if (Platform.OS === "web") {
      Object.assign(document.createElement("a"), {
        href: images[index],
        download: `image_${Date.now()}.jpg`,
      }).click()
      return
    }

    const destination = new Directory(Paths.cache, `image_${Date.now()}.jpg`)
    destination.create()

    const image = images[index]
    if (!image) {
      Toast.show({ type: "error", text1: "Could not save image" })
      return
    }

    try {
      // Request media library permissions
      const permission = await MediaLibrary.requestPermissionsAsync()
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Please allow access to photo library in your settings",
        })
        return
      }

      // Download image to cache directory first
      const output = await File.downloadFileAsync(image, destination)

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(output.uri)
    } catch (err: any) {
      console.error("Error saving image:", err)
      Toast.show({ type: "error", text1: "Failed to save image" })
    } finally {
      destination.delete()
    }
  }

  async function handleSaveAll() {
    if (Platform.OS === "web") {
      Toast.show({ type: "info", text1: "Not implemented yet!" })
      return
    }

    Toast.show({ type: "success", text1: "Downloading..." })
    for (let i = 0; i < images.length; i++) {
      await saveImage(i)
    }
    Toast.show({ type: "success", text1: `${images.length} images saved!` })
  }

  function handleReport() {
    Toast.show({
      type: "info",
      text1: "Feature Coming Soon",
      text2: "Report button will be implemented later",
    })
  }

  return (
    <DropdownMenu
      style={{ padding: 8 }}
      onPressAction={async action => {
        if (action === "save") {
          Toast.show({ type: "success", text1: "Downloading..." })
          await saveImage(currentIndex)
          Toast.show({ type: "success", text1: "Image saved!" })
        } else if (action === "saveAll") {
          await handleSaveAll()
        } else if (action === "report") {
          handleReport()
        }
      }}
      actions={actions}
    >
      <Feather name="more-vertical" size={24} color={colors.dark} />
    </DropdownMenu>
  )
}

/**
 * Individual image item component for the gallery
 */
function GalleryImageItem({
  item,
  index,
  deviceWidth,
  deviceHeight,
  doubleTapScale,
  minZoomScale,
  maxZoomScale,
  flashListRef,
  imageGap,
  itemWidth,
}: {
  item: string
  index: number
  deviceWidth: number
  deviceHeight: number
  doubleTapScale: number
  minZoomScale: number
  maxZoomScale: number
  flashListRef: React.RefObject<FlashListRef<string> | null>
  imageGap: number
  itemWidth: number
}): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const setIsZoomed = useSetAtom(isZoomedAtom)

  // Item container includes gap, but image displays at deviceWidth
  return (
    <View style={[styles.imageContainer, { width: itemWidth, height: deviceHeight }]}>
      <Zoom
        style={[
          styles.zoomContainer,
          {
            width: deviceWidth,
            height: deviceHeight,
            marginRight: imageGap,
          },
        ]}
        doubleTapConfig={{
          defaultScale: doubleTapScale,
          minZoomScale,
          maxZoomScale,
        }}
        enableGallerySwipe
        parentScrollRef={flashListRef}
        currentIndex={index}
        itemWidth={itemWidth}
        onZoomStateChange={z => setIsZoomed(z)}
      >
        <Image
          source={{ uri: item }}
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

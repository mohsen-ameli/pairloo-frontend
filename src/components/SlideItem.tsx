import {
  type ImageStyle,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
} from "react-native"
import Animated from "react-native-reanimated"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useAtomValue, useSetAtom } from "jotai"
import { settingsAtom } from "../store/create-post-store"
import { imgIndexAtom } from "../store/chat-store"
import { useRouter } from "expo-router"
import { commonStyles } from "../styles/common.styles"
import { isDraggingAtom } from "./ImageCarousel"

export function SlideItem({
  style,
  index,
  src,
  editable = false,
}: {
  style?: StyleProp<ImageStyle>
  index: number
  editable?: boolean
  src: string
}) {
  const setSettings = useSetAtom(settingsAtom)
  const setImgIdx = useSetAtom(imgIndexAtom)
  const router = useRouter()
  const isDragging = useAtomValue(isDraggingAtom)

  return (
    <Pressable
      style={{
        width: "100%",
        height: Platform.OS === "web" ? 500 : 300,
        borderRadius: 8,
      }}
      onPress={() => {
        if (isDragging) return
        setImgIdx(index)
        router.push("/image-gallery")
      }}
    >
      <Animated.Image style={[style, commonStyles.cardImage]} source={{ uri: src }} />

      {editable && (
        <View style={styles.removeOverlay}>
          <Pressable
            style={styles.removeOverlayButton}
            onPress={() => {
              setSettings(async curr => {
                const currSettings = await curr
                return {
                  ...currSettings,
                  images: currSettings.images.filter((_, i) => i !== index),
                }
              })
            }}
          >
            <Feather name="x" size={24} color={colors.dark} />
          </Pressable>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 600,
    height: 300,
    borderRadius: 15,
    backgroundColor: colors.lightGray,
  },
  removeOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeOverlayButton: {
    backgroundColor: colors.light,
    borderRadius: 20,
    padding: 5,
  },
  colorFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray,
  },
})

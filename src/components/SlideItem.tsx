import { Pressable, StyleSheet, View } from "react-native"
import Animated from "react-native-reanimated"
import { colors, isWeb } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useAtomValue, useSetAtom } from "jotai"
import { settingsAtom } from "@/src/store/create-post-store"
import { imgIndexAtom } from "@/src/store/chat-store"
import { useRouter } from "expo-router"
import { commonStyles } from "@/src/styles/common.styles"
import { isDraggingAtom } from "@/src/store/general-store"

export function SlideItem({
  index,
  src,
  editable = false,
}: {
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
        width: isWeb ? 600 : "100%",
        height: isWeb ? 500 : 300,
        borderRadius: 8,
      }}
      onPress={() => {
        if (isDragging) return
        setImgIdx(index)
        router.push("/image-gallery")
      }}
    >
      <Animated.Image style={commonStyles.cardImage} source={{ uri: src }} />

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
})

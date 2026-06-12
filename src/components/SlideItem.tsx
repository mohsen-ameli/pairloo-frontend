import { Pressable, StyleSheet, View } from "react-native"
import Animated from "react-native-reanimated"
import { colors, isWeb } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useAtomValue, useSetAtom } from "jotai"
import { createPostRemoveImageAtom } from "@/src/store/create-post-store"
import { imgIndexAtom } from "@/src/store/chat-store"
import { useRouter } from "expo-router"
import { commonStyles } from "@/src/styles/common.styles"
import { isDraggingAtom } from "@/src/store/general-store"
import { editPostRemoveImageAtom } from "../store/edit-post-store"

export type PageType = "create" | "edit" | "view"

export function SlideItem({
  index,
  src,
  imgKey,
  editable = false,
  pageType,
}: {
  index: number
  editable?: boolean
  src: string
  imgKey?: string
  pageType: PageType
}) {
  const setImgIdx = useSetAtom(imgIndexAtom)
  const router = useRouter()
  const isDragging = useAtomValue(isDraggingAtom)
  const handleRemoveEdit = useSetAtom(editPostRemoveImageAtom)
  const handleRemoveCreate = useSetAtom(createPostRemoveImageAtom)

  const handleRemove = () => {
    if (pageType === "edit") {
      handleRemoveEdit(imgKey!)
    } else {
      handleRemoveCreate(index)
    }
  }

  return (
    <Pressable
      style={{
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
          <Pressable style={styles.removeOverlayButton} onPress={handleRemove}>
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

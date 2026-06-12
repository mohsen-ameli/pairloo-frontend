import * as React from "react"
import { StyleSheet, View } from "react-native"
import Feather from "@expo/vector-icons/Feather"
import { colors } from "../utils/colors"
import { deletePostAtom, editPostAtom } from "../store/post-detail-store"
import { useSetAtom } from "jotai"
import DropdownMenu from "./DropdownMenu"
import Clipboard from "@react-native-clipboard/clipboard"
import { BASE_URL } from "../utils/constants"
import Toast from "react-native-toast-message"

export const MyPostMenu = ({ id, canEdit }: { id: string; canEdit: boolean }) => {
  const deletePost = useSetAtom(deletePostAtom)
  const editPost = useSetAtom(editPostAtom)

  return (
    <DropdownMenu
      style={styles.button}
      onPressAction={action => {
        if (action === "edit" && canEdit) {
          editPost(id)
        } else if (action === "share") {
          const postUrl = `${BASE_URL}/feed-post?feedPostId=${id}`
          Clipboard.setString(postUrl)
          Toast.show({ type: "success", text1: "Post link copied to clipboard!" })
        } else if (action === "destructive") {
          deletePost(id)
        }
      }}
      actions={[
        {
          id: "edit",
          title: "Edit",
          titleColor: colors.dark,
          icon: <Feather name="edit" size={20} color={colors.dark} />,
          visible: canEdit,
        },
        {
          id: "share",
          title: "Share",
          titleColor: colors.dark,
          icon: <Feather name="share-2" size={20} color={colors.dark} />,
          visible: canEdit,
        },
        {
          id: "destructive",
          title: "Delete",
          titleColor: colors.errorRed,
          icon: <Feather name="trash-2" size={20} color={colors.errorRed} />,
        },
      ]}
    >
      <View style={{ padding: 8 }}>
        <Feather name="more-vertical" size={24} color={colors.dark} />
      </View>
    </DropdownMenu>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  button: {
    padding: 8,
  },
  buttonText: { color: "white" },
})

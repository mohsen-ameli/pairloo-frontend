import * as React from "react"
import { Platform, StyleSheet } from "react-native"
import { MenuView, type MenuComponentRef } from "@react-native-menu/menu"
import { useRef } from "react"
import Feather from "@expo/vector-icons/Feather"
import { colors } from "../utils/colors"
import { deletePostAtom, editPostAtom } from "../store/post-detail-store"
import { useSetAtom } from "jotai"

export const MyPostMenu = ({ id }: { id: string }) => {
  const menuRef = useRef<MenuComponentRef>(null)
  const deletePost = useSetAtom(deletePostAtom)
  const editPost = useSetAtom(editPostAtom)

  return (
    <MenuView
      ref={menuRef}
      style={styles.button}
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event === "edit") {
          editPost()
        } else if (nativeEvent.event === "share") {
        } else if (nativeEvent.event === "destructive") {
          deletePost(id)
        }
      }}
      actions={[
        {
          id: "edit",
          title: "Edit",
          titleColor: colors.dark,
          image: Platform.select({
            ios: "plus",
            android: "",
          }),
          imageColor: colors.dark,
        },
        {
          id: "share",
          title: "Share",
          titleColor: colors.dark,
          image: Platform.select({
            ios: "square.and.arrow.up",
            android: "",
          }),
          imageColor: colors.dark,
        },
        {
          id: "destructive",
          title: "Delete",
          attributes: {
            destructive: true,
          },
          image: Platform.select({
            ios: "trash",
            android: "",
          }),
        },
      ]}
      testID="menuView"
    >
      <Feather name="more-vertical" size={24} color={colors.dark} />
    </MenuView>
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

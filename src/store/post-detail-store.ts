import { atom } from "jotai"
import { Alert } from "react-native"
import { router } from "expo-router/build/exports"
import { queryClientAtom } from "./general-store"
import { authFetchAtom } from "./auth-store"

export const loadingAtom = atom(false)

export const deletePostAtom = atom(null, async (get, set, id: string) => {
  Alert.alert("Confirm", "Are you sure you want to delete this post?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        set(loadingAtom, true)
        const res = await set(authFetchAtom, `/api/posts/${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          get(queryClientAtom).invalidateQueries({ queryKey: ["my-posts"] })
          router.navigate("(tabs)/profile")
          set(loadingAtom, false)
        } else {
          Alert.alert("Error", "Could not remove post. Please try again later.")
          set(loadingAtom, false)
        }
      },
    },
  ])
})

export const editPostAtom = atom(null, (get, set) => {
  Alert.alert("Edit", "Edit Functionality Will Be Added Soon")
})

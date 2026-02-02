import { atom } from "jotai"
import { Alert } from "react-native"
import { authFetchAtom } from "@/src/utils/auth-fetch"
import { router } from "expo-router/build/exports"
import { queryClientAtom } from "./general-store"

export const deletePostAtom = atom(
  null,
  async (
    get,
    set,
    {
      id,
    }: {
      id: string
    }
  ) => {
    Alert.alert("Confirm", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await set(authFetchAtom, `/api/posts/${id}`, {
            method: "DELETE",
          })
          if (res.ok) {
            get(queryClientAtom).invalidateQueries({ queryKey: ["my-posts"] })
            router.back()
          } else {
            Alert.alert("Error", "Could not remove post. Please try again later.")
          }
        },
      },
    ])
  }
)

export const editPostAtom = atom(null, (get, set) => {
  Alert.alert("Edit", "Edit Functionality Will Be Added Soon")
})

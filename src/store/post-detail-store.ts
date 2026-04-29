import { atom } from "jotai"
import { Alert } from "react-native"
import { router } from "expo-router/build/exports"
import Toast from "react-native-toast-message"
import { queryClientAtom } from "./general-store"
import { authFetchAtom } from "./auth-store"

export const loadingAtom = atom(false)
export const savedPostIdsAtom = atom<string[]>([])

export const savePostAtom = atom(null, async (get, set, id: string) => {
  set(loadingAtom, true)

  try {
    const res = await set(authFetchAtom, `/api/users/save-post/${id}`, {
      method: "POST",
    })

    if (res.ok) {
      const savedIds = get(savedPostIdsAtom)
      if (!savedIds.includes(id)) {
        set(savedPostIdsAtom, [...savedIds, id])
      }
      Toast.show({
        type: "savedPost",
        props: {
          username: "Post saved",
          message: "Added to your saved posts",
          iconName: "bookmark",
        },
      })
      get(queryClientAtom).invalidateQueries({ queryKey: ["my-saved-posts"] })
    } else {
      Alert.alert("Error", "Could not save post. Please try again later.")
    }
  } catch {
    Alert.alert("Error", "Could not save post. Please try again later.")
  } finally {
    set(loadingAtom, false)
  }
})

export const unsavePostAtom = atom(null, async (get, set, id: string) => {
  set(loadingAtom, true)

  try {
    const res = await set(authFetchAtom, `/api/users/save-post/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      const savedIds = get(savedPostIdsAtom)
      set(
        savedPostIdsAtom,
        savedIds.filter(postId => postId !== id)
      )
      Toast.show({
        type: "savedPost",
        props: {
          username: "Post removed",
          message: "Removed from your saved posts",
          iconName: "bookmark",
        },
      })
      get(queryClientAtom).invalidateQueries({ queryKey: ["my-saved-posts"] })
    } else {
      Alert.alert("Error", "Could not unsave post. Please try again later.")
    }
  } catch {
    Alert.alert("Error", "Could not unsave post. Please try again later.")
  } finally {
    set(loadingAtom, false)
  }
})

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

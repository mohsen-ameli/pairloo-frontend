import { AudioPlayer } from "expo-audio"
import { atom } from "jotai"
import * as ImagePicker from "expo-image-picker"
import { Alert } from "react-native"
import { QueryClient } from "@tanstack/react-query"
import { Attachment } from "../types/attachment.type"

export const queryClientAtom = atom(new QueryClient())

export const pathStore = atom("")

// For image carousel to indicate if we are currently dragging or not
export const isDraggingAtom = atom(false)

// Used to trigger a greet toast when user logs in or signs up for the first time
export const greetAtom = atom(false)

export const notificationSoundAtom = atom<AudioPlayer | null>(null)

// Returns an array of selected attachments with their uri, mimeType, and file blob
export const getAttachmentAtom = atom(
  null,
  async (get, set, pfp: boolean, option: "library" | "camera", multi: boolean) => {
    let results: ImagePicker.ImagePickerResult | null = null
    const res: Attachment[] = []

    if (option === "library") {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Permission to access the media library is required.")
        return res
      }

      results = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: multi,
        allowsEditing: pfp,
        aspect: pfp ? [3, 3] : undefined,
        shape: pfp ? "oval" : undefined,
      })
    } else if (option === "camera") {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Camera access is required to take photos.")
        return res
      }

      results = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: multi,
        allowsEditing: pfp,
        aspect: pfp ? [3, 3] : undefined,
        shape: pfp ? "oval" : undefined,
      })
    }

    if (results && !results.canceled) {
      for (const asset of results.assets) {
        const uri = asset.uri
        const mimeType = asset.mimeType || "image/jpeg"
        const response = await fetch(uri)
        const file = await response.blob()
        res.push({ uri, mimeType, file })
      }
    }

    return res
  }
)

import { atom } from "jotai"
import { authFetchAtom, userAtom, userSecureAtom } from "./auth-store"
import { Alert } from "react-native"
import { getAttachmentAtom } from "./general-store"

export const editFieldsAtom = atom({
  firstName: "",
  lastName: "",
  picture: "",
  pictureBlob: null as Blob | null,
  pictureMimeType: "",
  country: "",
  city: "",
  state: "",
  latitude: 0,
  longitude: 0,
  timezone: "",
  locationId: 0,
})

export const editModeAtom = atom(false)

export const loadingAtom = atom(false)

export const handleSaveEditAtom = atom(null, async (get, set) => {
  const user = await get(userAtom)
  const userJwt = await get(userSecureAtom)
  const editFields = get(editFieldsAtom)
  if (!user || !userJwt) return

  try {
    set(loadingAtom, true)

    const formData = new FormData()

    Object.entries(editFields).forEach(([key, value]) => {
      if (value) formData.append(key, value.toString())
    })

    if (editFields.pictureBlob) {
      formData.append("picture", editFields.pictureBlob, userJwt._id)
    }

    const response = await set(authFetchAtom, "/api/settings/update-profile", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    if (!response.ok) {
      let errorMessage = "Failed to update profile"
      try {
        const errorData = await response.json()
        if (errorData && errorData.message) {
          errorMessage = errorData.message
        }
      } catch {}
      Alert.alert("Update Failed", errorMessage)
      set(loadingAtom, false)
      return
    }
    const updatedUser = await response.json()
    set(userAtom, { ...user, ...updatedUser })
    set(editModeAtom, false)
    set(loadingAtom, false)
    Alert.alert("Profile Updated", "Your changes have been saved.")
  } catch (err: any) {
    set(loadingAtom, false)
    Alert.alert("Update Failed", err?.message || "An unexpected error occurred.")
  }
})

export const resetEditAtom = atom(null, async (get, set) => {
  const user = await get(userAtom)
  if (!user) return

  set(editFieldsAtom, curr => ({
    ...curr,
    firstName: user.firstName,
    lastName: user.lastName,
    picture: user.picture,
    country: user.country,
    city: user.city,
    state: user.state,
    latitude: user.latitude,
    longitude: user.longitude,
    timezone: user.timezone,
    locationId: user.locationId,
  }))
  set(editModeAtom, false)
})

export const setUserPfpAtom = atom(null, async (get, set, option: "library" | "camera") => {
  const user = await get(userAtom)
  if (!user) return

  // get the attachments
  const attachments = await set(getAttachmentAtom, true, option, false)

  if (!attachments) return
  set(editFieldsAtom, f => ({
    ...f,
    picture: attachments[0].uri,
    pictureBlob: attachments[0].file,
    pictureMimeType: attachments[0].mimeType,
  }))
})

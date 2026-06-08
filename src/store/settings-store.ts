import { atom } from "jotai"
import { authFetchAtom, userAtom, userSecureAtom } from "./auth-store"
import { getAttachmentAtom } from "./general-store"
import Toast from "react-native-toast-message"

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
  const user = get(userAtom)
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
      formData.append("picture", editFields.pictureBlob)
    }

    const response = await set(
      authFetchAtom,
      "/api/settings/update-profile",
      {
        method: "POST",
        body: formData,
      },
      true
    )

    const data = await response.json()
    if (response.status !== 200) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "An unexpected error occurred. Please try again later.",
      })
      set(loadingAtom, false)
      return
    }

    set(userAtom, { ...user, ...data })
    set(editModeAtom, false)
    set(loadingAtom, false)
    Toast.show({
      type: "success",
      text1: "Profile Updated",
      text2: "Your changes have been saved.",
    })
  } catch (err: any) {
    console.error("Error updating profile:", err)
    set(loadingAtom, false)
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: "An unexpected error occurred. Please try again later.",
    })
  }
})

export const resetEditAtom = atom(null, async (get, set) => {
  const user = get(userAtom)
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
  const user = get(userAtom)
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

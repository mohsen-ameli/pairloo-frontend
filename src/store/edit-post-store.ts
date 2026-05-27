import { atom } from "jotai"
import { Attachment } from "@/src/types/attachment.type"

export type EditPostFormState = {
  title: string
  description: string
  publicPost: boolean
  location: { latitude: number; longitude: number } | null
  closeCity: string
  distance: number
  newImages: Attachment[]
  existingImages: string[]
  removedImages: string[]
}

const createInitialEditPostFormState = (): EditPostFormState => ({
  title: "",
  description: "",
  publicPost: false,
  location: null,
  closeCity: "",
  distance: 5000,
  newImages: [],
  existingImages: [],
  removedImages: [],
})

export const editPostFormAtom = atom<EditPostFormState>(createInitialEditPostFormState())
export const editPostLoadingAtom = atom(false)
export const editPostHasChangesAtom = atom(false)

export const editPostRemoveImageAtom = atom(null, (get, set, index: number) => {
  const formState = get(editPostFormAtom)
  const totalExisting = formState.existingImages.length

  if (index < totalExisting) {
    const removedImage = formState.existingImages[index]
    set(editPostFormAtom, prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, imageIndex) => imageIndex !== index),
      removedImages: [...prev.removedImages, removedImage],
    }))
  } else {
    const newImageIndex = index - totalExisting
    set(editPostFormAtom, prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, imageIndex) => imageIndex !== newImageIndex),
    }))
  }

  set(editPostHasChangesAtom, true)
})

export const resetEditPostAtom = atom(null, (_get, set) => {
  set(editPostFormAtom, createInitialEditPostFormState())
  set(editPostLoadingAtom, false)
  set(editPostHasChangesAtom, false)
})

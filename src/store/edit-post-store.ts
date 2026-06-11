import { atom } from "jotai"

const form = {
  title: "",
  description: "",
  publicPost: false,
  images: [] as {
    key: string
    url: string
    removed: boolean
    file?: Blob
    mimeType?: string
    isExisting: boolean
  }[],
}

export type EditPostType = typeof form

export const editPostFormAtom = atom(form)
export const editPostLoadingAtom = atom(false)
export const editPostHasChangesAtom = atom(false)

// Function that's called when an image is removed
export const editPostRemoveImageAtom = atom(null, (get, set, key: string) => {
  set(editPostFormAtom, prev => ({
    ...prev,
    images: prev.images.map(img => {
      if (img.key === key) {
        return { ...img, removed: true }
      }
      return img
    }),
  }))
  set(editPostHasChangesAtom, true)
})

export const resetEditPostAtom = atom(null, (get, set) => {
  set(editPostFormAtom, form)
  set(editPostLoadingAtom, false)
  set(editPostHasChangesAtom, false)
})

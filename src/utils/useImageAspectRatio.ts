// Source - https://stackoverflow.com/a
// Posted by Paduado
// Retrieved 2026-01-23, License - CC BY-SA 4.0

import { useEffect, useState } from "react"
import { Image } from "react-native"

export default function useImageAspectRatio(imageUrl: string | null | undefined) {
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    if (!imageUrl) {
      return
    }

    let isValid = true
    Image.getSize(imageUrl, (width, height) => {
      if (isValid) {
        setAspectRatio(width / height)
      }
    })

    return () => {
      isValid = false
    }
  }, [imageUrl])

  return aspectRatio
}

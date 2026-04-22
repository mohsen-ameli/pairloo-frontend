import Constants from "expo-constants"
import { useEffect, useState } from "react"

type ExpoMapsModule = typeof import("expo-maps")

function isExpoGo() {
  const constants = Constants as typeof Constants & {
    appOwnership?: string
    executionEnvironment?: string
  }

  return constants.appOwnership === "expo" || constants.executionEnvironment === "storeClient"
}

export function useExpoMaps() {
  const expoGo = isExpoGo()
  const [maps, setMaps] = useState<ExpoMapsModule | null>(null)
  const [isLoading, setIsLoading] = useState(!expoGo)

  useEffect(() => {
    if (expoGo) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    import("expo-maps")
      .then(module => {
        if (!cancelled) {
          setMaps(module)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMaps(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [expoGo])

  return {
    maps,
    isExpoGo: expoGo,
    isLoading,
  }
}

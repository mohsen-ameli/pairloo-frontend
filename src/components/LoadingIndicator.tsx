import { View, ActivityIndicator } from "react-native"
import React from "react"
import { colors } from "@/src/utils/colors"

export default function LoadingIndicator({
  loading,
  transparent = false,
  opacity = 1,
}: {
  loading: boolean
  transparent?: boolean
  opacity?: number
}) {
  if (!loading) return null
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: transparent ? "transparent" : colors.light,
        opacity,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <ActivityIndicator size="large" color={colors.blue} />
    </View>
  )
}

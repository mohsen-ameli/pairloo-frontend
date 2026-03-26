import Ionicons from "@expo/vector-icons/Ionicons"
import { View } from "react-native"
import { colors } from "@/src/utils/colors"

export default function RatingStar({
  value,
  max = 5,
  size = 18,
}: {
  value: number
  max?: number
  size?: number
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Ionicons name="star-outline" size={size} color={colors.purple} />

      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: Math.floor((size * value) / (max + 0.8)),
          height: size,
          overflow: "hidden",
        }}
      >
        <Ionicons name="star" size={size} color={colors.purple} />
      </View>
    </View>
  )
}

import Ionicons from "@expo/vector-icons/Ionicons"
import { View } from "react-native"
import { colors } from "@/src/utils/colors"

export function RatingStars({
  value,
  max = 5,
  size = 18,
}: {
  value: number
  max?: number
  size?: number
}) {
  const fullStars = Math.floor(value)
  const hasHalfStar = value - fullStars >= 0.25 && value - fullStars < 0.75
  const emptyStars = Math.floor(max - value)

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 4,
      }}
    >
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <Ionicons key={index} name="star" size={size} color={colors.purple} />
      ))}

      {/* Partly filled stars e.g. 0.25, 0.5, 0.75 */}
      {hasHalfStar && (
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
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <Ionicons key={index} name="star-outline" size={size} color={colors.purple} />
      ))}
    </View>
  )
}

export function RatingStarSingle({
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

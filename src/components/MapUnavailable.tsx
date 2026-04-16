import { View, Text } from "react-native"
import { colors } from "@/src/utils/colors"

export default function MapUnavailable({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 240,
        borderRadius: 16,
        backgroundColor: colors.lightGray,
        borderWidth: 1,
        borderColor: colors.borderGray,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text style={{ color: colors.dark, fontSize: 18, fontWeight: "700", textAlign: "center" }}>
        {title}
      </Text>
      <Text
        style={{
          color: colors.gray,
          fontSize: 14,
          textAlign: "center",
          marginTop: 8,
          lineHeight: 20,
        }}
      >
        {description}
      </Text>
    </View>
  )
}

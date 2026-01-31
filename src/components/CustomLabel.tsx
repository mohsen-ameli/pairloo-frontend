import { View, Text } from "react-native"

interface CustomLabelProps {
  text: string
  backgroundColor: string
}

export default function CustomLabel({ text, backgroundColor }: CustomLabelProps) {
  return (
    <View
      style={{
        backgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
      }}
    >
      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>{text}</Text>
    </View>
  )
}

import React from "react"
import { View, Text } from "react-native"

interface CustomLabelProps {
  children: React.ReactNode
  backgroundColor: string
}

export default function CustomLabel({ children, backgroundColor }: CustomLabelProps) {
  return (
    <View
      style={{
        backgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
      }}
    >
      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>{children}</Text>
    </View>
  )
}

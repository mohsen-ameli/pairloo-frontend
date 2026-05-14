import React from "react"
import { View, Text, ViewStyle, TextStyle } from "react-native"

interface CustomLabelProps {
  children: React.ReactNode
  backgroundColor: string
  style?: ViewStyle
  textStyle?: TextStyle
}

export default function CustomLabel({
  children,
  backgroundColor,
  style,
  textStyle,
}: CustomLabelProps) {
  return (
    <View
      style={[
        {
          backgroundColor,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
          marginLeft: 8,
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
        },
        style,
      ]}
    >
      <Text style={[{ color: "white", fontSize: 12, fontWeight: "600" }, textStyle]}>
        {children}
      </Text>
    </View>
  )
}

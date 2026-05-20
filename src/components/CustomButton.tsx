import { colors } from "@/src/utils/colors"
import React from "react"
import { Appearance, Pressable, PressableProps, StyleProp, Text, ViewStyle } from "react-native"

interface CustomProps extends PressableProps {
  children: React.ReactNode
  color?: string
  disabled?: boolean
  fontSize?: number
  style?: StyleProp<ViewStyle>
}

const colorScheme = Appearance.getColorScheme()

export default function ({ color, children, disabled, fontSize, style, ...rest }: CustomProps) {
  const backgroundColor = disabled ? colors.borderGray : color || colors.purple
  const shadowColor = disabled ? colors.borderGray : color || colors.purple
  return (
    <Pressable
      style={[
        {
          width: "100%",
          paddingVertical: 16,
          backgroundColor,
          borderRadius: 10,
          alignItems: "center",
          boxShadow: `0px 2px 4px 0px ${shadowColor}`,
          elevation: 2,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={{
          color: colorScheme === "dark" ? colors.dark : colors.light,
          fontWeight: "bold",
          fontSize: fontSize ? fontSize : 18,
          letterSpacing: 0.5,
        }}
      >
        {children}
      </Text>
    </Pressable>
  )
}

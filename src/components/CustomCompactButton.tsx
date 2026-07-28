import { boxShadow, colors } from "@/src/utils/colors"
import React from "react"
import { DimensionValue, Pressable, PressableProps, StyleProp, Text, ViewStyle } from "react-native"

interface CustomProps extends PressableProps {
  children: React.ReactNode
  color?: string
  outline?: boolean
  width?: DimensionValue | undefined
  disabled?: boolean
  fontSize?: number
  style?: StyleProp<ViewStyle>
}

export default function CustomCompactButton({
  color,
  outline,
  width,
  children,
  disabled,
  fontSize,
  style,
  ...rest
}: CustomProps) {
  const backgroundColor = disabled ? colors.borderGray : color || colors.purple

  return (
    <Pressable
      style={[
        {
          width: width ? width : "auto",
          paddingHorizontal: 24,
          paddingVertical: 8,
          backgroundColor: outline ? "transparent" : backgroundColor,
          borderRadius: 6,
          shadowColor: "transparent",
          borderWidth: outline ? 2 : 0,
          borderColor: color || colors.purple,
          alignItems: "center",
          boxShadow: color ? undefined : boxShadow,
          elevation: 2,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text
        style={{
          color: colors.dark,
          fontWeight: "400",
          fontSize: fontSize ? fontSize : 16,
        }}
      >
        {children}
      </Text>
    </Pressable>
  )
}

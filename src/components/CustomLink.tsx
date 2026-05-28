import { boxShadow, colors } from "@/src/utils/colors"
import { Link, LinkProps } from "expo-router"
import React from "react"
import { Appearance, Pressable, Text } from "react-native"

interface CustomProps extends LinkProps {
  children: React.ReactNode
  color?: string
}

const colorScheme = Appearance.getColorScheme()

export default function CustomLink({ children, color, ...rest }: CustomProps) {
  return (
    <Link push asChild {...rest}>
      <Pressable
        style={{
          width: "100%",
          paddingVertical: 16,
          backgroundColor: color ? color : colors.purple,
          borderRadius: 10,
          alignItems: "center",
          boxShadow: color ? undefined : boxShadow,
        }}
      >
        <Text
          style={{
            color: colorScheme === "dark" ? colors.dark : colors.light,
            fontWeight: "bold",
            fontSize: 18,
            letterSpacing: 0.5,
          }}
        >
          {children}
        </Text>
      </Pressable>
    </Link>
  )
}

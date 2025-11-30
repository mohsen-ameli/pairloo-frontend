import { colors } from "@/src/utils/colors";
import { Link, LinkProps } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

type CustomProps = LinkProps & {
  text: string;
  color?: string;
};

export default function CustomLink({ text, color, ...rest }: CustomProps) {
  return (
    <Link push asChild {...rest}>
      <Pressable
        style={{
          width: "100%",
          paddingVertical: 16,
          backgroundColor: color ? color : colors.purple,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.light,
            fontSize: 20,
          }}
        >
          {text}
        </Text>
      </Pressable>
    </Link>
  );
}

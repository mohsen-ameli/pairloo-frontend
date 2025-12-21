import { colors } from "@/src/utils/colors";
import { Link, LinkProps } from "expo-router";
import React from "react";
import { Pressable, Text, StyleProp, ViewStyle, TextStyle } from "react-native";

type CustomProps = LinkProps & {
  text: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function CustomLink({ text, color, style, textStyle, ...rest }: CustomProps) {
  return (
    <Link push asChild {...rest}>
      <Pressable
        style={[
          {
            width: "100%",
            paddingVertical: 16,
            backgroundColor: color ? color : colors.purple,
            borderRadius: 10,
            alignItems: "center",
          },
          style,
        ]}
      >
        <Text
          style={[
            {
              color: colors.light,
              fontSize: 20,
            },
            textStyle,
          ]}
        >
          {text}
        </Text>
      </Pressable>
    </Link>
  );
}

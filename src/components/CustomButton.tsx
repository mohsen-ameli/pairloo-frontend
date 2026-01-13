import { colors } from "@/src/utils/colors";
import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  ViewStyle,
} from "react-native";

interface CustomProps extends PressableProps {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ({
  color,
  children,
  disabled,
  style,
  ...rest
}: CustomProps) {
  const backgroundColor = disabled ? colors.borderGray : color || colors.purple;
  const shadowColor = disabled ? colors.borderGray : color || colors.purple;
  return (
    <Pressable
      style={[
        {
          width: "100%",
          paddingVertical: 16,
          backgroundColor,
          borderRadius: 10,
          alignItems: "center",
          shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 2,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={{
          color: colors.light,
          fontWeight: "bold",
          fontSize: 18,
          letterSpacing: 0.5,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

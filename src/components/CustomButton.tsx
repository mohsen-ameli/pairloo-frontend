import { colors } from "@/src/utils/colors";
import React from "react";
import { Pressable, PressableProps, Text } from "react-native";

type CustomProps = PressableProps & {
  children: React.ReactNode;
  color?: string;
};

export default function ({ color, children, ...rest }: CustomProps) {
  return (
    <Pressable
      style={{
        width: "100%",
        paddingVertical: 16,
        backgroundColor: color ? color : colors.purple,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: color ? color : colors.purple,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      }}
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

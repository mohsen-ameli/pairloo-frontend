import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { colors } from "../utils/colors";

export default function CustomInput({ ...rest }: TextInputProps) {
  return (
    <TextInput
      style={{
        color: colors.dark,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.borderGray,
        padding: 10,
        borderRadius: 5,
        width: "100%",
      }}
      placeholderTextColor={colors.gray}
      selectionColor={colors.purple}
      {...rest}
    />
  );
}

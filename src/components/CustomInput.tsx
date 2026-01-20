import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "@/src/utils/colors";

interface Props extends TextInputProps {
  title: string;
  mandatory?: boolean;
  errors?: string;
}

export default function CustomInput({
  title,
  mandatory,
  errors,
  ...rest
}: Props) {
  return (
    <View>
      <Text style={{ fontSize: 14, marginBottom: 5, color: colors.dark }}>
        {title}
        {mandatory ? <Text style={{ color: colors.errorRed }}> *</Text> : null}
      </Text>
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
      {errors ? (
        <Text style={{ color: colors.errorRed, marginTop: 5 }}>{errors}</Text>
      ) : null}
    </View>
  );
}

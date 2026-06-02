import React from "react"
import { Text, TextInput, TextInputProps, View } from "react-native"
import { colors } from "@/src/utils/colors"
import { inputStyles } from "@/src/styles/input.styles"

interface Props extends TextInputProps {
  title?: string
  mandatory?: boolean
  errors?: React.ReactNode
  inputRef?: React.RefObject<TextInput>
  headerStyles?: TextInputProps["style"]
}

export default function CustomInput({
  title,
  mandatory,
  errors,
  inputRef,
  headerStyles,
  ...rest
}: Props) {
  return (
    <View>
      {title && (
        <Text
          style={[
            inputStyles.header,
            headerStyles,
            mandatory && { fontSize: 16, fontWeight: "600" },
          ]}
        >
          {title}
          {mandatory ? <Text style={inputStyles.mandatory}> *</Text> : null}
        </Text>
      )}
      <TextInput
        ref={inputRef}
        placeholderTextColor={colors.gray}
        selectionColor={colors.purple}
        {...rest}
        style={[
          inputStyles.input,
          rest.multiline && { height: 150, textAlignVertical: "top" },
          rest.style,
        ]}
      />
      {errors && <Text style={inputStyles.errors}>{errors}</Text>}
    </View>
  )
}

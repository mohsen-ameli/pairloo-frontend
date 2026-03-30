import React from "react"
import { Text, TextInput, TextInputProps, View } from "react-native"
import { colors } from "@/src/utils/colors"
import { inputStyles } from "@/src/styles/input.styles"

interface Props extends TextInputProps {
  title: string
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
      <Text style={[inputStyles.header, headerStyles]}>
        {title}
        {mandatory ? <Text style={inputStyles.mandatory}> *</Text> : null}
      </Text>
      <TextInput
        ref={inputRef}
        style={inputStyles.input}
        placeholderTextColor={colors.gray}
        selectionColor={colors.purple}
        {...rest}
      />
      {errors && <Text style={inputStyles.errors}>{errors}</Text>}
    </View>
  )
}

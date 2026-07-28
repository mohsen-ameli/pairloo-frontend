import React from "react"
import { DimensionValue, Text, TextInput, TextInputProps, View } from "react-native"
import { colors } from "@/src/utils/colors"
import { inputStyles } from "@/src/styles/input.styles"

interface Props extends TextInputProps {
  title?: string
  mandatory?: boolean
  errors?: React.ReactNode
  information?: React.ReactNode
  success?: React.ReactNode
  inputRef?: React.RefObject<TextInput>
  width?: DimensionValue | undefined
  headerStyles?: TextInputProps["style"]
}

export default function CustomInput({
  title,
  mandatory,
  errors,
  information,
  success,
  inputRef,
  headerStyles,
  width = "auto",
  ...rest
}: Props) {
  return (
    <View style={{ width }}>
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
      {Boolean(errors) ? <Text style={inputStyles.errors}>{errors}</Text> : null}
      {Boolean(information) ? <Text style={inputStyles.information}>{information}</Text> : null}
      {Boolean(success) ? <Text style={inputStyles.success}>{success}</Text> : null}
    </View>
  )
}

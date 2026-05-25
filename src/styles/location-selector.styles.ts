import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const locSelectStyles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    padding: 10,
    borderRadius: 5,
    width: "100%",
  },
  inputText: {
    fontSize: 14,
  },
  cityItem: {
    padding: 15,
    borderBottomColor: colors.borderGray,
    borderBottomWidth: 0.5,
  },
  cityText: { color: colors.dark, fontSize: 16 },
  stateCountryText: { color: colors.gray, fontSize: 14 },
})

import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const locSelectStyles = StyleSheet.create({
  cityItem: {
    padding: 15,
    borderBottomColor: colors.borderGray,
    borderBottomWidth: 0.5,
  },
  cityText: { color: colors.dark, fontSize: 16 },
  stateCountryText: { color: colors.gray, fontSize: 14 },
  informationText: {
    color: colors.dark,
    fontSize: 16,
    padding: 15,
  },
})

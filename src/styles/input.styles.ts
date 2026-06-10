import { StyleSheet } from "react-native"
import { colors } from "../utils/colors"

export const inputStyles = StyleSheet.create({
  input: {
    color: colors.dark,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    padding: 10,
    borderRadius: 5,
    width: "100%",
  },
  header: { fontSize: 14, marginBottom: 5, color: colors.dark },
  mandatory: { color: colors.errorRed },
  errors: { color: colors.errorRed, marginTop: 5 },
  information: { color: colors.blue, marginTop: 5 },
  success: { color: colors.green, marginTop: 5 },
})

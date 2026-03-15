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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.light,
  },
  searchContainer: {
    paddingVertical: 15,
    paddingRight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dismissButton: { paddingVertical: 10, paddingLeft: 20, paddingRight: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    padding: 10,
    borderRadius: 5,
    color: colors.dark,
    fontSize: 16,
    flex: 1,
  },
  cityItem: {
    padding: 15,
    borderBottomColor: colors.borderGray,
    borderBottomWidth: 0.5,
  },
  cityText: { color: colors.dark, fontSize: 16 },
  stateCountryText: { color: colors.gray, fontSize: 14 },
})

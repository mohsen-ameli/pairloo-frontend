import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const locSelecStyles = StyleSheet.create({
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
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dismissButton: { padding: 10 },
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
    marginBottom: 5,
  },
  cityText: { color: colors.dark, fontSize: 16 },
  stateCountryText: { color: colors.gray, fontSize: 14 },
})

import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const createPostStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    paddingTop: 45,
    paddingBottom: 100,
    paddingHorizontal: 20,
    borderColor: colors.borderGray,
    borderRightWidth: 1,
  },
  questionText: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  mcqOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  mcqOptionText: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    color: colors.dark,
    boxShadow: `0px 0px 1.5px 0.2px ${colors.shadow}`,
    padding: 10,
    textAlignVertical: "top",
    borderRadius: 5,
  },
  multiSelect: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
})

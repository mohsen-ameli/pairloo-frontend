import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const createPostStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    paddingTop: 55,
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
    borderWidth: 1.5,
    backgroundColor: colors.lightGray,
  },
  discardButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  discardButtonText: {
    color: colors.light,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    gap: 10,
    padding: 20,
    paddingTop: 70,
    borderColor: colors.borderGray,
    borderRightWidth: 1,
  },
  numMatchesInput: {
    color: colors.dark,
    borderColor: colors.gray,
    borderWidth: 1,
    padding: 10,
    width: 80,
    textAlign: "center",
    borderRadius: 5,
  },
})

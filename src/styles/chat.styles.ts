import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    backgroundColor: colors.light,
    padding: 10,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
  },
  inputContainer: {
    backgroundColor: colors.lightGray,
    paddingVertical: 7,
    paddingHorizontal: 10,
    paddingBottom: 35,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.dark,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingRight: 50,
  },
  sendButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: colors.purple,
  },
  messageItem: {
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  messageImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  messageUsername: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: "600",
  },
  messageDate: {
    fontSize: 10,
    color: colors.gray,
  },
  messageContent: {
    fontSize: 16,
    marginTop: 2,
    paddingRight: 50,
    flexWrap: "wrap",
  },
  plusIcon: {
    marginLeft: 5,
  },
})

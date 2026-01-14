import { StyleSheet } from "react-native";
import { colors } from "@/src/utils/colors";

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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.dark,
    borderWidth: 2,
    borderColor: colors.gray,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingRight: 50,
  },
  sendButton: {
    position: "absolute",
    right: 5,
    padding: 10,
    borderRadius: 30,
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
});

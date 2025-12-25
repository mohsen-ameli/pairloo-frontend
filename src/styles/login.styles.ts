import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export const styles = StyleSheet.create({
  pageContainer: {
    padding: 20,
    gap: 10,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: "bold",
    alignSelf: "center",
  },
  forgotLink: {
    color: colors.purple,
  },
  verificationInfo: {
    color: colors.gray,
    fontSize: 12,
    marginBottom: 10,
  },
  resendText: {
    marginBottom: 20,
  },
});

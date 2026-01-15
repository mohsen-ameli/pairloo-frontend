import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    gap: 10,
    padding: 20,
    paddingTop: 70,
    borderColor: colors.borderGray,
    borderRightWidth: 1,
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
  errorText: {
    color: colors.errorRed,
  },
});

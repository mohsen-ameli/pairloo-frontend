import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  pageContainer: {
    flex: 1,
    gap: 10,
    padding: 20,
    paddingTop: 70,
    borderColor: colors.borderGray,
    borderRightWidth: 1,
  },
  title: {
    color: colors.dark,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  error: {
    color: colors.errorRed,
  },
  note: {
    color: colors.dark,
  },
  verificationInfo: {
    marginTop: 10,
    color: colors.darkGray,
  },
  resendText: {
    marginBottom: 20,
  },
  forgotLink: {
    marginTop: 10,
    alignSelf: "center",
  },
});

import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    alignItems: "center",
  },
  pageContainer: {
    flex: 1,
    gap: 10,
    padding: 20,
    paddingTop: 70,
    paddingBottom: 200,
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
  resendText: {
    marginBottom: 20,
  },
  avatarContainer: {
    position: "absolute",
    bottom: -5,
    right: -15,
    backgroundColor: colors.purple,
    width: 70,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: 12,
  },
  avatarEdit: {
    fontSize: 14,
    color: colors.light,
  },
  usernameDisplay: {
    marginTop: 20,
    color: colors.dark,
    fontSize: 16,
  },
})

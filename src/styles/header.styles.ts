import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.light,
  },
  headerContent: {
    flex: 1,
  },
  headerBackIcon: {
    position: "absolute",
    left: 0,
    marginRight: 10,
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.dark,
  },
  otherHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.dark,
  },
  otherProfileButton: {
    backgroundColor: colors.light,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  otherProfileImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
})

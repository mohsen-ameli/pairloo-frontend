import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
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
  otherProfileUsername: {
    backgroundColor: colors.light,
    overflow: "hidden",
    marginLeft: 4,
  },
  profileImageContacted: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  profileImageNotContacted: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  settings: {
    padding: 6,
  },
})

import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  otherHeader: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
  },
  headerContent: {
    flex: 1,
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
  headerSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  otherProfileButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: colors.light,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  otherProfileImage: {
    width: 35,
    height: 35,
  },
})

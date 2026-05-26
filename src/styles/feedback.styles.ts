import { StyleSheet } from "react-native"
import { boxShadow, colors } from "@/src/utils/colors"

export const SIDE_OFFSET = 12
export const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
})

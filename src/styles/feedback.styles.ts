import { StyleSheet } from "react-native"
import { boxShadow, colors } from "@/src/utils/colors"

export const SIDE_OFFSET = 12
export const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
  },
  note: {
    marginTop: 8,
    color: colors.darkGray,
    fontStyle: "italic",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 8,
  },
})

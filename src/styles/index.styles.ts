import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 100,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.muted,
  },
  postCard: {
    marginBottom: 16,
    backgroundColor: colors.light,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderGray,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  postCardImage: {
    width: "100%",
    height: 220,
    backgroundColor: colors.lightGray,
  },
  postCardImageFill: {
    width: "100%",
    height: "100%",
  },
  postCardContent: {
    padding: 14,
  },
  postCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postCardLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 4,
  },
  postCategory: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  postPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
  },
  fabContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fabButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.blue,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: {
    color: colors.light,
    fontWeight: "600",
    fontSize: 16,
  },
})

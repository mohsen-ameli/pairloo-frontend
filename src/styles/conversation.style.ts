import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const conversationStyles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.muted,
  },
  item: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },
  image: { width: 50, height: 50, borderRadius: 25 },
  itemTitle: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  lastMessage: {
    color: colors.dark,
  },
  timestampContainer: {
    position: "absolute",
    right: 10,
    top: 10,
    bottom: 10,
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  timestamp: {
    fontSize: 13,
    color: colors.gray,
  },
  unreadBadge: {
    backgroundColor: colors.purple,
    borderRadius: 25,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    color: colors.light,
    fontSize: 14,
    fontWeight: "500",
  },
})

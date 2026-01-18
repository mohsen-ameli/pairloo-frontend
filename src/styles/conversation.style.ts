import { StyleSheet } from "react-native";
import { colors } from "@/src/utils/colors";

export const conversationStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    padding: 10,
    backgroundColor: colors.lightBackground,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: colors.light,
    borderRadius: 8,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
});

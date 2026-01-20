import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  feedContainer: {
    backgroundColor: colors.lightBackground,
    padding: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  column: { flex: 1, marginHorizontal: 4 },
  postCard: {
    marginBottom: 8,
    backgroundColor: colors.light,
    borderRadius: 8,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  postHeaderImage: {
    width: 40,
    borderRadius: 25,
    aspectRatio: 1,
    resizeMode: "cover",
  },
  postHeaderName: { fontSize: 14, color: colors.darkGray },
  postUsername: { fontSize: 12, color: colors.gray },
  postHeaderTextContainer: { marginLeft: 8 },
  postContent: {
    padding: 8,
    fontWeight: "bold",
    fontSize: 16,
    color: colors.dark,
  },
})

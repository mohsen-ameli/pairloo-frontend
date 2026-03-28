import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  feedContainer: {
    backgroundColor: colors.light,
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
    boxShadow: `0px 0px 1.5px 0.2px ${colors.shadow}`,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  postHeaderImage: {
    width: 37,
    borderRadius: 25,
    aspectRatio: 1,
    resizeMode: "cover",
  },
  postHeaderName: { fontSize: 14, color: colors.darkGray },
  postUsername: { fontSize: 12, color: colors.gray },
  postHeaderTextContainer: { marginLeft: 8, flex: 1 },
  postContent: {
    padding: 8,
    fontWeight: "bold",
    fontSize: 16,
    color: colors.dark,
  },
})

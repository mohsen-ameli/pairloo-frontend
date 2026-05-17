import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  listStyles: {
    backgroundColor: colors.light,
    flex: 1,
    paddingHorizontal: 10,
  },
  listContainerStyles: {
    backgroundColor: colors.light,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  postCard: {
    marginBottom: 14,
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
  },
  postImageContainer: {
    width: "100%",
    height: 220,
    backgroundColor: colors.lightGray,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 1,
    marginTop: 8,
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 1,
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
  descriptionStyle: {
    padding: 8,
    fontSize: 14,
    color: colors.darkGray,
  },
})

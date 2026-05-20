import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  postHeaderImage: {
    width: 37,
    borderRadius: 25,
    aspectRatio: 1,
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
    paddingHorizontal: 8,
    marginBottom: 8,
    fontSize: 14,
    color: colors.darkGray,
  },
})

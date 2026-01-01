import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.blue,
    marginBottom: 16,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: colors.lightGray,
  },
  fieldLine: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 10,
    lineHeight: 22,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: colors.darkGray,
    textTransform: "capitalize",
  },
  closestPostsContainer: {
    marginTop: 28,
    borderRadius: 10,
  },
  closestPost: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.dark,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  closestPostsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 10,
  },
  closestPostScore: {
    fontSize: 14,
    color: colors.purple,
    fontWeight: "600",
    marginLeft: 8,
    flexShrink: 0,
    flexGrow: 0,
    textAlign: "right",
  },
  closestPostItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  closestPostName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.darkGray,
    flexShrink: 1,
    flexGrow: 1,
    marginRight: 8,
  },
  closestPostImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.lightGray,
  },
  closestPostPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.borderGray,
    justifyContent: "center",
    alignItems: "center",
  },
  closestPostDetails: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
    marginBottom: 6,
  },
});

export default styles;

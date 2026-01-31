import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 10,
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
  postContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: colors.darkGray,
    lineHeight: 22,
    marginBottom: 16,
    marginLeft: 5,
  },
  qnaSection: {
    marginBottom: 24,
  },
  qnaCard: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    shadowColor: colors.dark,
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  qnaCardHeader: {
    marginBottom: 12,
  },
  qnaCardQuestion: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
    lineHeight: 20,
  },
  qnaLabel: {
    fontWeight: "700",
    color: colors.purple,
  },
  qnaCardAnswerSection: {
    marginTop: 8,
  },
  qnaAnswerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.gray,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  qnaCardAnswer: {
    fontSize: 13,
    color: colors.dark,
    lineHeight: 18,
    marginBottom: 4,
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
    flexShrink: 0,
    flexGrow: 0,
    textAlign: "right",
  },
  closestPostHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closestPostItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxHeight: 275,
    marginBottom: 8,
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
    marginBottom: 12,
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
  closestPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
  },
  closestPostAvatarImage: {
    width: "100%",
    height: "100%",
  },
  closestPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  closestPostUsername: {
    fontSize: 14,
    color: colors.gray,
  },
  closestPostUserInfo: {
    flexDirection: "column",
  },
})

export default styles

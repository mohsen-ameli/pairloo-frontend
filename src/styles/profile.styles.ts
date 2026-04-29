import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const profileStyles = StyleSheet.create({
  generalContainer: {
    flex: 1,
    backgroundColor: colors.light,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: colors.light,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.dark,
  },
  textSm: {
    fontSize: 16,
    color: colors.gray,
  },
  textMd: {
    fontSize: 16,
    color: colors.gray,
  },
  text: {
    fontSize: 16,
    color: colors.gray,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  actionContainer: {
    flexDirection: "row",
    marginTop: 25,
    marginBottom: 15,
    backgroundColor: colors.borderGray,
    borderRadius: 20,
  },
  nonActiveTab: {
    fontSize: 15,
    padding: 4,
    fontWeight: "normal",
    color: colors.dark,
  },
  activeTab: {
    fontSize: 15,
    padding: 4,
    fontWeight: "bold",
    color: colors.darkPurple,
  },
  profileTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTabAnimation: {
    position: "absolute",
    width: "33.33%",
    height: "100%",
    backgroundColor: colors.purple,
    borderRadius: 20,
  },
  followContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  unfollowButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.purple,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  followButton: {
    backgroundColor: colors.purple,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  privatePostText: {
    color: colors.light,
    fontSize: 12,
  },
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "bold",
    flexShrink: 1,
    marginRight: 8,
    color: colors.dark,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
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
  postCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postCardContent: {
    padding: 14,
    paddingTop: 12,
  },
  postCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postCardFooterContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 4,
    width: "90%",
  },
  postDate: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
  },
  postCardLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
})

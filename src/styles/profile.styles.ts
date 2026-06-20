import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const profileStyles = StyleSheet.create({
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignSelf: "center",
  },
  headerContainer: {
    alignItems: "center",
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
  textGray: {
    fontSize: 16,
    color: colors.gray,
  },
  text: {
    fontSize: 16,
    color: colors.dark,
  },
  ratingContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  ratingValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  socialPressable: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  socialPressableCount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
    textAlign: "center",
  },
  socialPressableLabel: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
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
    color: colors.light,
  },
  profileTab: {
    flex: 1,
    paddingVertical: 6,
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
    alignSelf: "center",
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
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
  socialModalContainer: {
    flex: 1,
    backgroundColor: colors.light,
    paddingHorizontal: 16,
  },
  socialListContent: {
    paddingBottom: 24,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  socialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
  },
  socialName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  socialUsername: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
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

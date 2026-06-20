import { StyleSheet } from "react-native"
import { boxShadow, colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 5,
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
  locationText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 5,
    textAlign: "center",
  },
  // Q&A Section Styles
  qnaSection: {
    marginBottom: 24,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
  },
  qnaCollapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    borderColor: colors.borderGray,
  },
  qnaHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.darkGray,
  },
  qnaCard: {
    padding: 14,
    borderTopWidth: 3,
    borderColor: colors.borderGray,
    boxShadow,
  },
  qnaCardHeader: {
    marginBottom: 12,
  },
  qnaCardQuestion: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkGray,
    lineHeight: 21,
  },
  qnaLabel: {
    fontWeight: "700",
    color: colors.purple,
  },
  qnaCardAnswerSection: {
    marginTop: 8,
  },
  qnaCardAnswer: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.dark,
    lineHeight: 19,
    marginBottom: 4,
  },
  closestPostsContainer: {
    marginTop: 28,
    borderRadius: 10,
  },
  closestPostsTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 15,
    textAlign: "center",
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
  noMatchesText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  headerUserImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  postUserUsername: {
    color: colors.dark,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  // Map Styles
  mapContainer: {
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  mapFlexContainer: {
    flex: 1,
    pointerEvents: "none",
  },
  mapOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  radiusCircle: {
    width: 250,
    height: 250,
    borderRadius: 150,
    backgroundColor: "rgba(128, 0, 128, 0.2)",
    borderColor: colors.purple,
    borderWidth: 2,
  },
  timestampText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 5,
    marginBottom: 16,
  },
  statusLabel: {
    marginLeft: -5,
    marginTop: 2,
    paddingBottom: 10,
    alignSelf: "flex-start",
  },
  statusMenuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    gap: 6,
  },
  statusMenuContainer: {
    marginTop: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})

export default styles

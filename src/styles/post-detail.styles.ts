import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 48,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 5,
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
  locationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
    marginTop: 15,
    marginLeft: 5,
    textAlign: "center",
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
  qnaCollapseIcon: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: "600",
  },
  qnaCard: {
    padding: 14,
    borderTopWidth: 3,
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
  qnaAnswerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.gray,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  qnaCardAnswer: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.dark,
    lineHeight: 19,
    marginBottom: 4,
  },
  // Closest Posts / Matching Styles
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
    fontSize: 25,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 15,
    textAlign: "center",
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
  // Modal Container Override
  modalContainer: {
    paddingTop: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    flex: 1,
  },
  // Android Header
  androidHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerUserRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  headerUserUsername: {
    fontSize: 14,
    color: "#666",
  },
  headerCloseButton: {
    marginLeft: 16,
  },
  // iOS Close Button
  iosCloseButton: {
    position: "absolute",
    top: 24,
    right: 16,
    zIndex: 101,
    padding: 8,
  },
  // ScrollView
  scrollViewContainer: {
    flex: 1,
  },
  // iOS User Info
  iosUserInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iosUserImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  iosUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  iosUserUsername: {
    fontSize: 14,
    color: "#666",
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
  },
  mapOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  radiusCircle: {
    width: 250,
    height: 250,
    borderRadius: 150,
    backgroundColor: "rgba(128, 0, 128, 0.2)",
    borderColor: colors.purple,
    borderWidth: 2,
  },
  // Timestamp
  timestampText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 5,
    marginBottom: 16,
  },
  // Contact Button Container
  contactButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  // Close Icon Container (for loading/error states)
  closeIconContainer: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 10,
  },
})

export default styles

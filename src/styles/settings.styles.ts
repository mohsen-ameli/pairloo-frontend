import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    padding: 12,
    boxShadow: `0px 0px 1.5px 0.2px ${colors.shadow}`,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
    flexShrink: 1,
  },
  profileUsername: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderGray,
    marginVertical: 12,
  },
  editableContainer: { gap: 12, marginTop: 8 },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.gray,
    paddingRight: 8,
  },
  fieldValue: {
    fontSize: 14,
    color: colors.dark,
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  privacyPolicyLink: {
    marginTop: 18,
  },
  privacyPolicyText: {
    fontSize: 14,
    color: colors.purple,
    textDecorationLine: "underline",
  },
})

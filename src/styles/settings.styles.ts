import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export const styles = StyleSheet.create({
  editInputContainer: {
    flex: 1,
    marginLeft: 12,
    },
    editInput: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.lightBackground,
    fontSize: 14,
    color: colors.dark,
    width: "100%",
  },
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "box-none",
  },
  fabButton: {
    backgroundColor: "#f74949ff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: {
    color: colors.light,
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    overflow: "hidden",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
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
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  fieldValue: {
    fontSize: 14,
    color: colors.dark,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
});

import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.light,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 12,
    width: 40,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  touchableWrapper: {
    flex: 1,
  },
});

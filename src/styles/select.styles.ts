import { StyleSheet } from "react-native";
import { colors } from "@/src/utils/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    marginTop: 60,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.light,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.dark,
  },
  content: {
    flex: 1,
    gap: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optionCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    width: "80%",
  },
  needCard: {
    backgroundColor: colors.lightBlue,
  },
  provideCard: {
    backgroundColor: colors.lightGreen,
  },
  cardContent: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  needCardTitle: {
    color: colors.purple,
  },
  provideCardTitle: {
    color: colors.green,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

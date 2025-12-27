import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    width: "80%",
  },
  needCard: {
    backgroundColor: "#F0E7FF",
  },
  provideCard: {
    backgroundColor: "#E7F5ED",
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
    color: "#6B46C1",
  },
  provideCardTitle: {
    color: "#059669",
  },
  cardDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  needCardDescription: {
    color: "#7C3AED",
  },
  provideCardDescription: {
    color: "#10B981",
  },
  touchableWrapper: {},
});

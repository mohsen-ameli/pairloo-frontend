import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
    gap: 16,
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
    alignSelf: "center",
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
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
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
  touchableWrapper: {
    flex: 1,
  },
});

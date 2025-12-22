import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
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
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
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
    color: "#000",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  jobCard: {
    backgroundColor: "#FFF3E0",
  },
  partnerCard: {
    backgroundColor: "#FCE4EC",
  },
  productCard: {
    backgroundColor: "#E3F2FD",
  },
  petCard: {
    backgroundColor: "#F1F8E9",
  },
  somethingCard: {
    backgroundColor: "#EDE7F6",
  },
  touchableWrapper: {
    flex: 1,
  },
});

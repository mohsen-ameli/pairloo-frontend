import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#007AFF",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#eee",
  },
  fieldLine: {
    fontSize: 16,
    color: "#222",
    marginBottom: 10,
    lineHeight: 22,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#222",
    textTransform: "capitalize",
  },
  error: {
    color: "#d00",
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 18,
    alignSelf: "flex-start",
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  closestProductsContainer: {
    marginTop: 28,
    borderRadius: 10,
  },
  closestProduct: {
    // make this look like a card
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  closestProductsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  closestProductScore: {
    fontSize: 14,
    color: colors.purple,
    fontWeight: "600",
    marginLeft: 8,
    flexShrink: 0,
    flexGrow: 0,
    textAlign: "right",
  },
  closestProductItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  closestProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    flexShrink: 1,
    flexGrow: 1,
    marginRight: 8,
  },
  closestProductType: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  closestProductImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  closestProductPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  closestProductDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginBottom: 6,
  },
});

export default styles;

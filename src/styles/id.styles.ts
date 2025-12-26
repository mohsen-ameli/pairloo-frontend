import { StyleSheet } from "react-native";

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
});

export default styles;

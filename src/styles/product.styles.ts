import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 13,
    color: "#999",
    marginBottom: 24,
  },
  formContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
    marginTop: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  inputDescription: {
    fontSize: 12,
    color: "#999",
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#f0f0f0",
  },
  backButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: colors.lightPurple,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

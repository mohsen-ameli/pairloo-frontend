import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
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
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  progressText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
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
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
  },
  inputPlaceholder: {
    fontSize: 14,
    color: "#ccc",
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
  nextButton: {
    backgroundColor: "#007AFF",
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#34C759",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  singlePageContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
    marginTop: 24,
  },
});

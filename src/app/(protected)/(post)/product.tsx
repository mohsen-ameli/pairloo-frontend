import CustomInput from "@/src/components/CustomInput";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./_styles/product.styles";
import { useAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";

const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const SHIPPING_OPTIONS = ["Yes", "No", "Local Pickup Only"];

export default function Product() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  if (params.action == "need") return <Need />;
  return <Provide />;
}

function Need() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, authFetch] = useAtom(authFetchAtom);
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    priceRange: "",
    condition: "",
    colorModel: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    // Validate quantity - only numbers
    if (field === "quantity") {
      processedValue = value.replace(/[^0-9]/g, "");
    }

    // Validate price - only numbers (will add $ prefix on display)
    if (field === "priceRange") {
      processedValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.productName || !formData.quantity || !formData.priceRange) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      setLoading(true);

      const response = await authFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          action: "need",
          productName: formData.productName,
          quantity: parseInt(formData.quantity),
          price: formData.priceRange,
          condition: formData.condition,
          colorModel: formData.colorModel,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to search for product");
        return;
      }

      Alert.alert("Success", "Product search created successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to create product search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 20, color: "#000" }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Looking for a Product</Text>
        <Text style={styles.headerSubtitle}>Tell us what you're searching for</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <View>
            <Text style={styles.pageTitle}>Product Details</Text>
            <Text style={styles.pageDescription}>
              Help us find the right product for you
            </Text>

            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name</Text>
                <CustomInput
                  placeholder="e.g., iPhone 14 Pro"
                  value={formData.productName}
                  onChangeText={(text) =>
                    handleInputChange("productName", text)
                  }
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <CustomInput
                  placeholder="e.g., 1"
                  value={formData.quantity}
                  onChangeText={(text) => handleInputChange("quantity", text)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price Range</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", marginRight: 8 }}>
                    $
                  </Text>
                  <CustomInput
                    placeholder="e.g., 500 - 1000"
                    value={formData.priceRange}
                    onChangeText={(text) =>
                      handleInputChange("priceRange", text)
                    }
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Condition</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                    paddingHorizontal: 0,
                  }}
                >
                  <Picker
                    selectedValue={formData.condition}
                    onValueChange={(itemValue: string) =>
                      handleInputChange("condition", itemValue)
                    }
                    style={{
                      height: 50,
                      color: "#000",
                    }}
                  >
                    <Picker.Item label="Select Condition" value="" />
                    {CONDITIONS.map((condition) => (
                      <Picker.Item key={condition} label={condition} value={condition} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Color/Model</Text>
                <CustomInput
                  placeholder="e.g., Space Gray, 256GB"
                  value={formData.colorModel}
                  onChangeText={(text) => handleInputChange("colorModel", text)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Notes</Text>
                <CustomInput
                  placeholder="Any special requirements?"
                  value={formData.notes}
                  onChangeText={(text) => handleInputChange("notes", text)}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Provide() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, authFetch] = useAtom(authFetchAtom);
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    price: "",
    condition: "",
    description: "",
    specifications: "",
    reason: "",
    shipping: "",
    location: "",
  });

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    // Validate quantity - only numbers
    if (field === "quantity") {
      processedValue = value.replace(/[^0-9]/g, "");
    }

    // Validate price - only numbers (will add $ prefix on display)
    if (field === "price") {
      processedValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.productName ||
        !formData.quantity ||
        !formData.price ||
        !formData.shipping ||
        !formData.location
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      setLoading(true);

      const response = await authFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          action: "provide",
          productName: formData.productName,
          quantity: parseInt(formData.quantity),
          price: formData.price,
          condition: formData.condition,
          description: formData.description,
          specifications: formData.specifications,
          reason: formData.reason,
          shipping: formData.shipping,
          location: formData.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to list product");
        return;
      }

      Alert.alert("Success", "Product listed successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to list product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sell a Product</Text>
        <Text style={styles.headerSubtitle}>List your item for sale</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <View>
            <Text style={styles.sectionTitle}>Product Information</Text>
            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <CustomInput
                  placeholder="e.g., iPhone 14 Pro"
                  value={formData.productName}
                  onChangeText={(text) =>
                    handleInputChange("productName", text)
                  }
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <CustomInput
                  placeholder="e.g., 1"
                  value={formData.quantity}
                  onChangeText={(text) => handleInputChange("quantity", text)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price *</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", marginRight: 8 }}>
                    $
                  </Text>
                  <CustomInput
                    placeholder="e.g., 800"
                    value={formData.price}
                    onChangeText={(text) => handleInputChange("price", text)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Condition *</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                    paddingHorizontal: 0,
                  }}
                >
                  <Picker
                    selectedValue={formData.condition}
                    onValueChange={(itemValue: string) =>
                      handleInputChange("condition", itemValue)
                    }
                    style={{
                      height: 50,
                      color: "#000",
                    }}
                  >
                    <Picker.Item label="Select Condition" value="" />
                    {CONDITIONS.map((condition) => (
                      <Picker.Item key={condition} label={condition} value={condition} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Description *</Text>
                <CustomInput
                  placeholder="Describe your product in detail"
                  value={formData.description}
                  onChangeText={(text) =>
                    handleInputChange("description", text)
                  }
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specifications</Text>
                <CustomInput
                  placeholder="e.g., Color, Model, Storage, etc."
                  value={formData.specifications}
                  onChangeText={(text) =>
                    handleInputChange("specifications", text)
                  }
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Why are you selling? (Optional)</Text>
                <CustomInput
                  placeholder="e.g., Upgrade, Not needed anymore"
                  value={formData.reason}
                  onChangeText={(text) => handleInputChange("reason", text)}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Shipping & Contact</Text>
            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shipping Available? *</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                    paddingHorizontal: 0,
                  }}
                >
                  <Picker
                    selectedValue={formData.shipping}
                    onValueChange={(itemValue: string) =>
                      handleInputChange("shipping", itemValue)
                    }
                    style={{
                      height: 50,
                      color: "#000",
                    }}
                  >
                    <Picker.Item label="Select Shipping Option" value="" />
                    {SHIPPING_OPTIONS.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location *</Text>
                <CustomInput
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChangeText={(text) => handleInputChange("location", text)}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>List Product</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

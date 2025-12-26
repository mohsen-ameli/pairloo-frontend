import CustomInput from "@/src/components/CustomInput";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import { styles } from "@/src/styles/product.styles";
import { useSetAtom } from "jotai";
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
  const authFetch = useSetAtom(authFetchAtom);
  const formData = useRef<{
    category?: string;
    name?: string;
    region?: string;
    quantity?: string;
    price?: string;
  }>({});

  const handleSubmit = async () => {
    try {
      if (
        !formData ||
        !formData.current.category ||
        !formData.current.name ||
        !formData.current.price ||
        !formData.current.region ||
        !formData.current.quantity
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      setLoading(true);

      const response = await authFetch("/api/posts/products", {
        method: "POST",
        body: JSON.stringify({
          type: "need",
          ...formData.current,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", "Could not create post!");
        return;
      }

      Alert.alert("Success", "Product post created successfully!");
      router.dismissAll();
      router.replace("/");
      router.push(`/${data.product._id}`);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Could not create post!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Tell us what you're searching for
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category*</Text>
                <CustomInput
                  placeholder="e.g., Electronics"
                  onChangeText={(text) => (formData.current.category = text)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name*</Text>
                <CustomInput
                  placeholder="e.g., iPhone 14 Pro"
                  onChangeText={(text) => (formData.current.name = text)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity*</Text>
                <CustomInput
                  placeholder="e.g., 1"
                  onChangeText={(text) => (formData.current.quantity = text)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price*</Text>
                <CustomInput
                  placeholder="e.g., 500"
                  onChangeText={(text) => (formData.current.price = text)}
                  keyboardType="numeric"
                  inputMode="numeric"
                  returnKeyType="done"
                  maxLength={20}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Region*</Text>
                <CustomInput
                  placeholder="e.g., San Francisco, CA"
                  onChangeText={(text) => (formData.current.region = text)}
                  keyboardType="numeric"
                  inputMode="numeric"
                  returnKeyType="done"
                />
              </View>
              {/* <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Condition</Text>
                <Dropdown
                  style={{
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                    paddingHorizontal: 12,
                    height: 50,
                  }}
                  placeholderStyle={{ color: "#888" }}
                  selectedTextStyle={{ color: "#000" }}
                  data={CONDITIONS.map((c) => ({ label: c, value: c }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Condition"
                  onChange={(item) => (formData.current.condition = text)
                  }
                />
              </View> */}
              {/* <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Color/Model</Text>
                <CustomInput
                  placeholder="e.g., Space Gray, 256GB"
                  onChangeText={(text) => (formData.current.colorModel = text)}
                />
              </View> */}
              {/* <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Notes</Text>
                <CustomInput
                  placeholder="Any special requirements?"
                  onChangeText={(text) => (formData.current.notes = text)}
                />
              </View> */}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Provide() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const authFetch = useSetAtom(authFetchAtom);
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

    if (field === "quantity") {
      processedValue = value.replace(/[^0-9]/g, "");
    }

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>List your item for sale</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                <CustomInput
                  placeholder="e.g., 800"
                  value={formData.price}
                  onChangeText={(text) => handleInputChange("price", text)}
                  keyboardType="numeric"
                  inputMode="numeric"
                  returnKeyType="done"
                  maxLength={8}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Condition *</Text>
                <Dropdown
                  style={{
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                    paddingHorizontal: 12,
                    height: 50,
                  }}
                  placeholderStyle={{ color: "#888" }}
                  selectedTextStyle={{ color: "#000" }}
                  data={CONDITIONS.map((c) => ({ label: c, value: c }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Condition"
                  value={formData.condition}
                  onChange={(item) =>
                    handleInputChange("condition", item.value)
                  }
                />
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
                <Text style={styles.inputLabel}>
                  Why are you selling? (Optional)
                </Text>
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
                <Dropdown
                  style={{
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                    paddingHorizontal: 12,
                    height: 50,
                  }}
                  placeholderStyle={{ color: "#888" }}
                  selectedTextStyle={{ color: "#000" }}
                  data={SHIPPING_OPTIONS.map((o) => ({ label: o, value: o }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Shipping Option"
                  value={formData.shipping}
                  onChange={(item) => handleInputChange("shipping", item.value)}
                />
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

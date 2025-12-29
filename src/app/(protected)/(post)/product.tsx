import CustomInput from "@/src/components/CustomInput";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styles } from "@/src/styles/product.styles";
import { useSetAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import CustomButton from "@/src/components/CustomButton";

const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const SHIPPING_OPTIONS = ["Yes", "No", "Local Pickup Only"];

export default function Product() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();
  const type = params.action === "need" ? "need" : "provide";

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

  async function handleSubmit() {
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
          type,
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
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {type === "need" ? (
          <Text style={styles.headerTitle}>What product are you looking for?</Text>
        ) : (
          <Text style={styles.headerTitle}>List your item for sale</Text>
        )}
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
                <Text style={styles.inputLabel}>Location*</Text>
                <CustomInput
                  placeholder="e.g., San Francisco, CA"
                  onChangeText={(text) => (formData.current.region = text)}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <View style={styles.footerContainer}>
        <CustomButton onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>Submit</>
          )}
        </CustomButton>
      </View>
    </View>
  );
}

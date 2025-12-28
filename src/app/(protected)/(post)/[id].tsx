import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import styles from "@/src/styles/id.styles";
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import CustomButton from "@/src/components/CustomButton";
import { PostType } from "@/src/types/post.type";
import { colors } from "@/src/utils/colors";

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authFetch = useSetAtom(authFetchAtom);
  const [post, setPost] = useState<PostType>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closestProducts, setClosestProducts] = useState<
    {
      product: PostType;
      score: string;
    }[]
  >([]);

  async function fetchPostData(postId: string) {
    const res = await authFetch(`/api/posts/${postId}`);
    if (!res.ok) {
      Alert.alert("Error", "Could not fetch post data");
      router.back();
      return;
    }

    const data: PostType = await res.json();
    setPost(data);

    for (const closeProduct of data.closestProducts || []) {
      const productRes = await authFetch(`/api/posts/${closeProduct.item}`);
      if (productRes.ok) {
        const productData: PostType = await productRes.json();
        setClosestProducts((prev) => [
          ...prev,
          { product: productData, score: closeProduct.score },
        ]);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPostData(id);
  }, [id]);

  async function removePost() {
    if (!post) return;
    setLoading(true);
    const res = await authFetch(`/api/posts/${post._id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.back();
    } else {
      setLoading(false);
      setError("Could not remove post. Please try again.");
    }
  }

  if (loading) return <LoadingIndicator loading={loading} />;

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!post) return null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {post.image && (
          <Image
            source={{ uri: post.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.title}>{post.name || post.name}</Text>
        <Text style={styles.subtitle}>
          {post.type === "need" ? "Looking for" : "Offering"}
        </Text>

        {post.quantity !== undefined && (
          <Text style={styles.fieldLine}>
            <Text style={styles.fieldLabel}>quantity:</Text> {post.quantity}
          </Text>
        )}
        {post.price && (
          <Text style={styles.fieldLine}>
            <Text style={styles.fieldLabel}>price:</Text> {post.price}
          </Text>
        )}
        {post.region && (
          <Text style={styles.fieldLine}>
            <Text style={styles.fieldLabel}>location:</Text> {post.region}
          </Text>
        )}
        <CustomButton
          color={colors.errorRed}
          onPress={() => {
            Alert.alert(
              "Confirm",
              "Are you sure you want to remove this post?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: removePost,
                },
              ]
            );
          }}
        >
          Remove Post
        </CustomButton>

        {/* Closest posts */}
        {closestProducts.length > 0 && (
          <View style={styles.closestProductsContainer}>
            <Text style={styles.closestProductsTitle}>Similar Posts:</Text>
            {closestProducts.map((product) => (
              <View key={product.product._id} style={styles.closestProduct}>
                <View style={styles.closestProductItem}>
                  {product.product.image ? (
                    <Image
                      source={{ uri: product.product.image }}
                      style={styles.closestProductImage}
                    />
                  ) : (
                    <View style={styles.closestProductPlaceholder} />
                  )}
                  <Text style={styles.closestProductName}>
                    {product.product.name}
                  </Text>
                  <Text style={styles.closestProductScore}>
                    {Math.round(parseFloat(product.score) * 100)}% match
                  </Text>
                </View>
                <Text style={styles.closestProductDetails}>
                  {product.product.quantity
                    ? `Quantity: ${product.product.quantity} | `
                    : ""}
                  {product.product.price
                    ? `Price: ${product.product.price}`
                    : ""}
                </Text>
                <Text style={styles.closestProductDetails}>
                  {product.product.region || "Unknown location"}
                </Text>
                <CustomButton
                  onPress={() => {
                    Alert.alert(
                      "Contact",
                      `Contact user for post: ${product.product.name}`
                    );
                  }}
                >
                  Contact
                </CustomButton>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.contactButton} onPress={() => {}}>
          <Text style={styles.contactButtonText}>Contact Post Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import styles from "@/src/styles/id.styles";
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import { PostType } from "@/src/types/post.type";
import LoadingIndicator from "@/src/components/LoadingIndicator";
// @ts-ignore
import imageNotAvailable from "@/assets/images/image-not-available.png";
import CustomButton from "@/src/components/CustomButton";

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authFetch = useSetAtom(authFetchAtom);
  const [post, setPost] = useState<PostType>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closestProducts, setClosestProducts] = useState<PostType[]>([]);

  async function fetchPostData(postId: string) {
    const res = await authFetch(`/api/posts/${postId}`);
    if (res.ok) {
      const data = await res.json();
      setPost(data);

      for (const productId of data.closestProducts || []) {
        const productRes = await authFetch(`/api/posts/${productId}`);
        if (productRes.ok) {
          const productData = await productRes.json();
          setClosestProducts((prev) => [...prev, productData]);
        }
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPostData(id);
  }, [id]);

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
        <Image
          source={imageNotAvailable}
          style={styles.productImage}
          resizeMode="cover"
        />
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
        {/* {post.condition && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>condition:</Text> {post.condition}</Text>
        )}
        {post.description && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>description:</Text> {post.description}</Text>
        )}
        {post.shipping && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>shipping:</Text> {post.shipping}</Text>
        )} */}
        {post.region && (
          <Text style={styles.fieldLine}>
            <Text style={styles.fieldLabel}>location:</Text> {post.region}
          </Text>
        )}
        <View style={{ height: 90 }} />
      </ScrollView>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#fff",
          padding: 16,
        }}
      >
        <CustomButton onPress={() => {}}>Contact Post Owner</CustomButton>
      </View>
    </View>
  );
}

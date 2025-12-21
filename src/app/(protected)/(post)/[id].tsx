
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import styles from "./[id].styles";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, authFetch] = useAtom(authFetchAtom);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch post");
        setPost(data);
      } catch (e: any) {
        setError(e.message || "Error loading post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!post) return null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Image
          source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTcFI6hTmgUtdxQTZktMt5KgEbySf4mtRgfQ&s" }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <Text style={styles.title}>{post.productName || post.name}</Text>
        <Text style={styles.subtitle}>{post.action === "need" ? "Looking for" : "Offering"}</Text>

        {post.quantity !== undefined && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>quantity:</Text> {post.quantity}</Text>
        )}
        {(post.price || post.priceRange) && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>price:</Text> {post.price || post.priceRange}</Text>
        )}
        {post.condition && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>condition:</Text> {post.condition}</Text>
        )}
        {post.colorModel && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>color/model:</Text> {post.colorModel}</Text>
        )}
        {post.description && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>description:</Text> {post.description}</Text>
        )}
        {post.specifications && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>specifications:</Text> {post.specifications}</Text>
        )}
        {post.notes && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>notes:</Text> {post.notes}</Text>
        )}
        {post.reason && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>reason:</Text> {post.reason}</Text>
        )}
        {post.shipping && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>shipping:</Text> {post.shipping}</Text>
        )}
        {post.location && (
          <Text style={styles.fieldLine}><Text style={styles.fieldLabel}>location:</Text> {post.location}</Text>
        )}
        <View style={{ height: 90 }} />
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', padding: 16 }}>
        <TouchableOpacity style={styles.contactButton} onPress={() => {}}>
          <Text style={styles.contactButtonText}>Contact Post Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



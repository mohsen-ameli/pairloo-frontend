import { PostType } from "@/src/types/post.type";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import { colors } from "@/src/utils/colors";
import { useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";

export default function Post() {
  const id = useLocalSearchParams<{ id: string }>().id;
  const authFetch = useSetAtom(authFetchAtom);
  const [post, setPost] = useState<PostType>();
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
    }
  }

  useEffect(() => {
    fetchPostData(id);
  }, [id]);

  if (!post) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        gap: 20,
      }}
    >
      <View
        style={{
          padding: 20,
          gap: 10,
          backgroundColor: colors.niceBlue,
        }}
      >
        <Text style={{ fontSize: 30 }}>My Post</Text>
        <Text>Name: {post.name}</Text>
        <Text>Category: {post.category}</Text>
        <Text>Region: {post.region}</Text>
        <Text>Quantity: {post.quantity}</Text>
        <Text>Price: ${post.price}</Text>
      </View>
      {closestProducts && closestProducts.length > 0 && (
        <View
          style={{
            padding: 20,
            gap: 10,
            backgroundColor: colors.niceBlue,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            Closest Products:
          </Text>
          {closestProducts.map((product) => (
            <View
              key={product._id}
              style={{
                padding: 10,
                backgroundColor: colors.lightPurple,
              }}
            >
              <Text>Name: {product.name}</Text>
              <Text>Category: {product.category}</Text>
              <Text>Region: {product.region}</Text>
              <Text>Quantity: {product.quantity}</Text>
              <Text>Price: ${product.price}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, Alert } from "react-native";
import styles from "@/src/styles/id.styles";
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import CustomButton from "@/src/components/CustomButton";
import { MyPostType } from "@/src/types/post.type";
import { colors } from "@/src/utils/colors";
import ImageCarousel from "@/src/components/ImageCarousel";

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authFetch = useSetAtom(authFetchAtom);
  const [post, setPost] = useState<MyPostType>();
  const [loading, setLoading] = useState(true);

  async function fetchPostData(postId: string) {
    if (post) return;

    const res = await authFetch(`/api/posts/${postId}`);
    if (!res.ok) {
      Alert.alert("Error", "Could not fetch post data");
      router.back();
      return;
    }

    const data: MyPostType = await res.json();
    setPost(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPostData(id);
  }, [id]);

  if (loading) return <LoadingIndicator loading={loading} />;
  if (!post) return null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {post.images.length != 0 && <ImageCarousel images={post.images} />}
        <Text style={styles.title}>{post.content}</Text>
        <Text style={styles.subtitle}>{post.summary}</Text>

        <CustomButton
          color={colors.green}
          onPress={() => {
            console.log("Should redirect to a chat with the poster");
          }}
        >
          Contact Poster
        </CustomButton>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

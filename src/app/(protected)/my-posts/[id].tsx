import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, Image, Alert } from "react-native";
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
  const [closestPosts, setClosestPosts] = useState<
    {
      post: PostType;
      score: string;
    }[]
  >([]);

  async function fetchPostData(postId: string) {
    if (post || closestPosts.length > 0) return;

    const res = await authFetch(`/api/posts/${postId}`);
    if (!res.ok) {
      Alert.alert("Error", "Could not fetch post data");
      router.back();
      return;
    }

    const data: PostType = await res.json();
    setPost(data);

    for (const closePost of data.closestPosts || []) {
      const postRes = await authFetch(`/api/posts/${closePost.item}`);
      if (postRes.ok) {
        const postData: PostType = await postRes.json();
        setClosestPosts((prev) => [
          ...prev,
          { post: postData, score: closePost.score },
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
      Alert.alert("Error", "Could not remove post. Please try again later.");
    }
  }

  if (loading) return <LoadingIndicator loading={loading} />;
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
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.title}>{post.content}</Text>
        <Text style={styles.subtitle}>{post.summary}</Text>

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
        {closestPosts.length > 0 && (
          <View style={styles.closestPostsContainer}>
            <Text style={styles.closestPostsTitle}>Similar Posts:</Text>
            {closestPosts.map((post) => (
              <View key={post.post._id} style={styles.closestPost}>
                <View style={styles.closestPostItem}>
                  {post.post.image ? (
                    <Image
                      source={{ uri: post.post.image }}
                      style={styles.closestPostImage}
                    />
                  ) : (
                    <View style={styles.closestPostPlaceholder} />
                  )}
                  <Text style={styles.closestPostName}>
                    {post.post.content}
                  </Text>
                  <Text style={styles.closestPostScore}>
                    {Math.round(parseFloat(post.score) * 100)}% match
                  </Text>
                </View>
                <CustomButton
                  onPress={() => {
                    Alert.alert(
                      "Contact",
                      `Contact user for post: ${post.post._id}`
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
    </View>
  );
}

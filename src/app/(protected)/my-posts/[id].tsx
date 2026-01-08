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
  const [closestPosts, setClosestPosts] = useState<
    {
      post: MyPostType;
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

    const data: MyPostType = await res.json();
    setPost(data);

    for (const closePost of data.closestPosts || []) {
      const postRes = await authFetch(`/api/posts/${closePost.item}`);
      if (postRes.ok) {
        const postData: MyPostType = await postRes.json();
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

  function getScoreColor(score: number) {
    if (score < 0.25) {
      return colors.errorRed;
    } else if (score < 0.75) {
      return colors.yellow;
    } else {
      return colors.successGreen;
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
        {post.images.length != 0 && <ImageCarousel images={post.images} />}
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
                <View style={styles.closestPostImage}>
                  {post.post.images.length != 0 && (
                    <ImageCarousel images={post.post.images} widthOffset={70} />
                  )}
                </View>
                <View style={styles.closestPostItem}>
                  <Text style={styles.closestPostName}>
                    {post.post.content}
                  </Text>
                  <Text
                    style={[
                      styles.closestPostScore,
                      { color: getScoreColor(parseFloat(post.score)) },
                    ]}
                  >
                    {Math.round(parseFloat(post.score) * 100)}% match
                  </Text>
                </View>
                <CustomButton
                  onPress={() => {
                    router.push(`/${post.post._id}`);
                  }}
                >
                  View Post
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

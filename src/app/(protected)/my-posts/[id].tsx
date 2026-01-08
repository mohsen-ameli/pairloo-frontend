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
import { getScoreColor } from "@/src/utils/lerp-color";
import { Image } from "expo-image";

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authFetch = useSetAtom(authFetchAtom);
  const [post, setPost] = useState<MyPostType>();
  const [loading, setLoading] = useState(true);

  async function fetchPostData(postId: string) {
    if (post) return;

    const res = await authFetch(`/api/posts/my-posts/${postId}`);
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.postContainer}>
          {post.images && post.images.length != 0 && (
            <ImageCarousel images={post.images} />
          )}
          <Text style={styles.title}>{post.content}</Text>
          <Text style={styles.subtitle}>{post.summary}</Text>
        </View>

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
        {post.closestPosts && post.closestPosts.length > 0 && (
          <View style={styles.closestPostsContainer}>
            <Text style={styles.closestPostsTitle}>Similar Posts:</Text>
            {post.closestPosts.map((post) => (
              <View key={post._id} style={styles.closestPost}>
                <View style={styles.closestPostHeader}>
                  {post.picture && (
                    <View style={styles.closestPostAvatar}>
                      <Image
                        source={{ uri: post.picture }}
                        style={styles.closestPostAvatarImage}
                      />
                    </View>
                  )}
                  <View style={styles.closestPostUserInfo}>
                    <Text style={styles.closestPostName}>
                      {post.firstName} {post.lastName}
                    </Text>
                    <Text style={styles.closestPostUsername}>
                      @{post.username}
                    </Text>
                  </View>
                </View>
                <View style={styles.closestPostImage}>
                  {post.images && post.images.length != 0 && (
                    <ImageCarousel images={post.images} widthOffset={70} />
                  )}
                </View>
                <View style={styles.closestPostItem}>
                  <Text style={styles.closestPostName}>{post.content}</Text>
                  <Text
                    style={[
                      styles.closestPostScore,
                      {
                        color: getScoreColor(
                          colors.errorRed,
                          colors.yellow,
                          colors.successGreen,
                          parseFloat(post.score)
                        ),
                      },
                    ]}
                  >
                    {Math.round(parseFloat(post.score) * 100)}% match
                  </Text>
                </View>
                <CustomButton
                  onPress={() => {
                    router.push(`/${post._id}`);
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

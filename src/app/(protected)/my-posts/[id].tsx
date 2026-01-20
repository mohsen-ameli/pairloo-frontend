import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import styles from "@/src/styles/id.styles";
import { useSetAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import CustomButton from "@/src/components/CustomButton";
import { MyPostType } from "@/src/types/post.type";
import { colors } from "@/src/utils/colors";
import ImageCarousel from "@/src/components/ImageCarousel";
import { Image } from "expo-image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorStyles } from "@/src/styles/error.styles";

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authFetch = useSetAtom(authFetchAtom);
  const queryClient = useQueryClient();
  const {
    data: post,
    isError,
    isPending,
  } = useQuery({ queryKey: [`post-${id}`], queryFn: fetchPost });
  const { mutate, isPending: isPendingMutation } = useMutation({
    mutationFn: removePost,
  });

  async function fetchPost() {
    const res = await authFetch(`/api/posts/my-posts/${id}`);
    const data: MyPostType = await res.json();
    return data;
  }

  async function removePost() {
    const res = await authFetch(`/api/posts/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.back();
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    } else {
      Alert.alert("Error", "Could not remove post. Please try again later.");
    }
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: [`post-${id}`] });
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

  if (isPending || isPendingMutation) {
    return (
      <View style={styles.container}>
        <LoadingIndicator loading={true} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={errorStyles.errorText}>
          Error loading posts. Please try again.
        </Text>
        <Pressable style={errorStyles.retryButton} onPress={refresh}>
          <Text style={errorStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
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
                    onPress: () => mutate(),
                  },
                ],
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
                        { color: getScoreColor(parseFloat(post.score)) },
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
    </>
  );
}

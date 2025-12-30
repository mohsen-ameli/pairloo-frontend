import { authFetchAtom } from "@/src/utils/auth-fetch";
import { postsAtom, userAtom } from "@/src/utils/store";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { styles } from "@/src/styles/index.styles";
// @ts-ignore
import imageNotAvailable from "@/assets/images/image-not-available.png";
// @ts-ignore
import defaultProfilePicture from "@/assets/images/default_pfp.png";
import LoadingIndicator from "@/src/components/LoadingIndicator";

export default function Index() {
  const router = useRouter();
  const user = useAtomValue(userAtom)!;
  const authFetch = useSetAtom(authFetchAtom);
  const [posts, setPosts] = useAtom(postsAtom);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchPosts() {
    let firstFetch = false;
    if (posts.length === 0) firstFetch = true;
    firstFetch && setLoading(true);
    const res = await authFetch("/api/posts/all-posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
    firstFetch && setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }

  function handleProfilePress() {}

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [posts])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Posts</Text>
                <Text style={styles.headerSubtitle}>
                  Welcome back, {user.firstName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleProfilePress}
                style={styles.profileButton}
              >
                <Image
                  source={
                    user.picture ? { uri: user.picture } : defaultProfilePicture
                  }
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <LoadingIndicator loading={loading} />

      {/* Posts List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              No posts yet. Create one to get started!
            </Text>
          </View>
        ) : (
          posts.map((post, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.postCard, styles.postCardShadow]}
              onPress={() => router.push(`/my-posts/${post._id}`)}
            >
              <View style={styles.postCardContent}>
                <View style={[styles.postImage, styles.postImageBackground]}>
                  <Image
                    source={imageNotAvailable}
                    style={styles.postImageFill}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.postTextContainer}>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {post.name}
                  </Text>
                  <Text style={styles.postCategory}>
                    {post.type === "need" ? "Looking for" : "Offering"}
                  </Text>
                  <Text style={styles.postPrice}>${post.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

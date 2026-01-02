import { authFetchAtom } from "@/src/utils/auth-fetch";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
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
import LoadingIndicator from "@/src/components/LoadingIndicator";
import CustomHeader from "@/src/components/CustomHeader";
import { MyPostType } from "@/src/types/post.type";

const postsAtom = atom<MyPostType[]>([]);

export default function Index() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const authFetch = useSetAtom(authFetchAtom);
  const [posts, setPosts] = useAtom(postsAtom);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (redirect) {
      router.push(redirect as any);
    }
  }, [redirect]);

  async function fetchPosts() {
    let firstFetch = false;
    if (posts.length === 0) firstFetch = true;
    firstFetch && setLoading(true);
    const res = await authFetch("/api/posts/my-posts");
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

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="My Posts" />

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
                    {post.content}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

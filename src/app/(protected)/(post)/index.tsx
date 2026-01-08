import { authFetchAtom } from "@/src/utils/auth-fetch";
import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import CustomHeader from "@/src/components/CustomHeader";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { styles } from "@/src/styles/feed.styles";
import { GeneralPostType } from "@/src/types/post.type";

const postsAtom = atom<GeneralPostType[][]>([[]]);

export default function Index() {
  const router = useRouter();
  const authFetch = useSetAtom(authFetchAtom);
  const [posts, setPosts] = useAtom(postsAtom);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchPosts() {
    let firstFetch = false;
    if (posts.length === 0) firstFetch = true;
    firstFetch && setLoading(true);
    const res = await authFetch("/api/posts/my-feed");
    if (res.ok) {
      const data = (await res.json()) as GeneralPostType[];

      // Masonry logic
      const numColumns = 2;
      const columns: Array<typeof data> = Array.from(
        { length: numColumns },
        () => []
      );
      data.forEach((post, idx) => {
        columns[idx % numColumns].push(post);
      });
      setPosts(columns);
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
    <>
      <CustomHeader title="Posts" />

      <LoadingIndicator loading={loading} />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map((col, colIdx) => (
          <View key={colIdx} style={styles.column}>
            {col.map((post) => (
              <Pressable
                key={post._id}
                style={styles.postCard}
                onPress={() => {
                  router.push(`/${post._id}`);
                }}
              >
                <View style={styles.postHeader}>
                  {post.picture && (
                    <Image
                      source={{ uri: post.picture }}
                      style={styles.postHeaderImage}
                    />
                  )}
                  <Text style={styles.postHeaderText}>@{post.username}</Text>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );
}

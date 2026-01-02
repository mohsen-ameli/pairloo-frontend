import { authFetchAtom } from "@/src/utils/auth-fetch";
import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Text, View, Image, ScrollView, RefreshControl } from "react-native";
import CustomHeader from "@/src/components/CustomHeader";
import { colors } from "@/src/utils/colors";
import { FeedPostType } from "@/src/types/post.type";
import LoadingIndicator from "@/src/components/LoadingIndicator";

const postsAtom = atom<FeedPostType[][]>([[]]);

export default function Index() {
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
      const data = (await res.json()) as FeedPostType[];
      console.log(data);

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
        contentContainerStyle={{
          flex: 1,
          backgroundColor: colors.light,
          padding: 8,
          flexDirection: "row",
          alignItems: "flex-start",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map((col, colIdx) => (
          <View key={colIdx} style={{ flex: 1, marginHorizontal: 4 }}>
            {col.map((post, idx) => (
              <View
                key={post._id || idx}
                style={{
                  marginBottom: 8,
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  overflow: "hidden",
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 8,
                  }}
                >
                  {post.picture && (
                    <Image
                      source={{ uri: post.picture }}
                      style={{
                        width: 40,
                        borderRadius: 25,
                        aspectRatio: 1,
                        resizeMode: "cover",
                      }}
                    />
                  )}
                  <Text style={{ padding: 8, fontSize: 14, color: "#555" }}>
                    @{post.username}
                  </Text>
                </View>
                {post.image && (
                  <Image
                    source={{ uri: post.image }}
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      resizeMode: "cover",
                    }}
                  />
                )}
                <View style={{ padding: 8 }}>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    {post.content}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );
}

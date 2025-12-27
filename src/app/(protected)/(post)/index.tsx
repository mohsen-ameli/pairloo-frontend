import { PostType } from "@/src/types/post.type";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import { logOutAtom, userAtom } from "@/src/utils/store";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { styles } from "@/src/styles/index.styles";
// @ts-ignore
import imageNotAvailable from "@/assets/images/image-not-available.png";
// @ts-ignore
import defaultProfilePicture from "@/assets/images/default_pfp.png";
import LoadingIndicator from "@/src/components/LoadingIndicator";

export default function index() {
  const user = useAtomValue(userAtom)!;
  const logout = useSetAtom(logOutAtom);
  const authFetch = useSetAtom(authFetchAtom);
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    const res = await authFetch("/api/posts/all-posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  function handleLogoutPress() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Posts</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {user.firstName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogoutPress}
          style={styles.profileButton}
        >
          <Image
            source={user.picture ? { uri: user.picture } : defaultProfilePicture}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

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
              onPress={() => router.push(`/${post._id}`)}
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
                    {post.type === "need" ? "Looking for" : "Selling"}
                  </Text>
                  <Text style={styles.postPrice}>${post.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Link push href="/select" asChild>
        <TouchableOpacity style={styles.fabContainer}>
          <View style={styles.fabButton}>
            <Text style={styles.fabText}>Make a New Post</Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

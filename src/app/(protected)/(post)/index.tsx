import CustomLink from "@/src/components/CustomLink";
import { PostType } from "@/src/types/post.type";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import { colors } from "@/src/utils/colors";
import { getUserInfoAtom } from "@/src/utils/get-user";
import { logOutAtom, userAtom } from "@/src/utils/store";

import { Image } from "expo-image";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { styles } from "./_styles/index.styles";

export default function index() {
  const user = useAtomValue(userAtom);
  const logout = useSetAtom(logOutAtom);
  const getUserInfo = useAtom(getUserInfoAtom)[1];
  const authFetch = useSetAtom(authFetchAtom);
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPosts() {
    const res = await authFetch("/api/posts/all-posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
  }

  useEffect(() => {
    getUserInfo();
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await authFetch("/api/products/my-products", {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok && data.products) {
          setPosts(data.products);
        } else {
          console.error("Failed to fetch posts:", data.message);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [authFetch]);

  const handleLogoutPress = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

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
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              onPress={() => router.push(`/(post)/${post._id}`)}
            >
              <View style={styles.postCardContent}>
                <View style={[styles.postImage, styles.postImageBackground]}>
                  <Image
                    source={{
                      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTvGPEc8bhcT2Zl66lisGIPqVJ3PhKD8Xvzw&s",
                    }}
                    style={styles.postImageFill}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.postTextContainer}>
                  <Text
                    style={styles.postTitle}
                    numberOfLines={1}
                  >
                    {post.productName}
                  </Text>
                  <Text style={styles.postCategory}>
                    {post.type === "need" ? "Looking for" : "Selling"}
                  </Text>
                  <Text style={styles.postPrice}>
                    {post.price}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
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

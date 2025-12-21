import CustomLink from "@/src/components/CustomLink";
import { colors } from "@/src/utils/colors";
import { getUserInfoAtom } from "@/src/utils/get-user";
import { logOutAtom, userAtom } from "@/src/utils/store";
import { authFetchAtom } from "@/src/utils/auth-fetch";
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
  const router = useRouter();
  const getUserInfo = useAtom(getUserInfoAtom)[1];
  const [, authFetch] = useAtom(authFetchAtom);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  useEffect(() => {
    getUserInfo();
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
            source={user.picture}
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
                    {post.action === "need" ? "Looking for" : "Selling"}
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
            <Text style={styles.fabText}>Search or Post Item</Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

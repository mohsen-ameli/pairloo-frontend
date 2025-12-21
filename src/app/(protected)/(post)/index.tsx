import CustomButton from "@/src/components/CustomButton";
import CustomLink from "@/src/components/CustomLink";
import { PostType } from "@/src/types/post.type";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import { colors } from "@/src/utils/colors";
import { getUserInfoAtom } from "@/src/utils/get-user";
import { logOutAtom, userAtom } from "@/src/utils/store";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function index() {
  const user = useAtomValue(userAtom);
  const logout = useSetAtom(logOutAtom);
  const getUserInfo = useAtom(getUserInfoAtom)[1];
  const authFetch = useSetAtom(authFetchAtom);
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[]>([]);

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

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        gap: 20,
      }}
    >
      <View style={{ alignItems: "center", gap: 10 }}>
        <Image
          source={user.picture}
          style={{
            width: 50,
            height: 50,
            borderRadius: 50,
            backgroundColor: "#0553",
          }}
        />
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
          }}
        >
          Welcome, {user.username}
        </Text>
      </View>

      <CustomButton text="Logout" onPress={logout} />
      <CustomLink text="Create new post" href="/select" />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 20,
        }}
      >
        Your Posts
      </Text>
      {posts.length === 0 && (
        <Text
          style={{
            fontSize: 16,
            color: "#666",
          }}
        >
          You have no posts yet.
        </Text>
      )}
      {posts.map((post, index) => (
        <Pressable
          key={index}
          onPress={() => {
            // Navigate to post details
            router.push(`/${post._id}`);
          }}
        >
          <View
            key={index}
            style={{
              width: "100%",
              height: 100,
              backgroundColor: "rgba(193, 253, 255, 1)",
              borderRadius: 10,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                backgroundColor: colors.borderGray,
                overflow: "hidden",
              }}
            >
              <Image
                source={post.image}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                contentFit="cover"
              />
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {post.name}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#666",
                }}
              >
                {post.category}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              ${post.price}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

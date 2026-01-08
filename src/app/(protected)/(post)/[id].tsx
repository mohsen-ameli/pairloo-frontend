import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";
import styles from "@/src/styles/id.styles";
import { useSetAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import CustomButton from "@/src/components/CustomButton";
import { GeneralPostType } from "@/src/types/post.type";
import ImageCarousel from "@/src/components/ImageCarousel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { errorStyles } from "@/src/styles/error.styles";

export default function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const authFetch = useSetAtom(authFetchAtom);
  const queryClient = useQueryClient();
  const {
    data: post,
    isError,
    isPending,
  } = useQuery({ queryKey: [`post-${id}`], queryFn: fetchPost });

  async function fetchPost() {
    const res = await authFetch(`/api/posts/${id}`);
    const data: GeneralPostType = await res.json();
    return data;
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: [`post-${id}`] });
  }

  if (isPending) {
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {post.images && post.images.length != 0 && (
          <ImageCarousel images={post.images} />
        )}
        <Text style={styles.title}>{post.content}</Text>
        <Text style={styles.subtitle}>{post.summary}</Text>

        <View style={{ height: 20 }} />
      </ScrollView>
      <View style={{ paddingHorizontal: 16, marginBottom: 32, marginTop: 5 }}>
        <CustomButton
          onPress={() => {
            console.log("Should redirect to a chat with the poster");
          }}
        >
          Contact Poster
        </CustomButton>
      </View>
    </View>
  );
}

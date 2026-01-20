import { authFetchAtom } from "@/src/utils/auth-fetch"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { ScrollView, Text, View, TouchableOpacity, RefreshControl, Pressable } from "react-native"
import { styles } from "@/src/styles/index.styles"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { MyPostType } from "@/src/types/post.type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"

const imageNotAvailable = require("@/assets/images/image-not-available.png")

export default function Index() {
  const router = useRouter()
  const { redirect } = useLocalSearchParams<{ redirect?: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const {
    data: posts,
    isError,
    isPending,
  } = useQuery({ queryKey: ["my-posts"], queryFn: fetchPosts })

  useEffect(() => {
    if (redirect) {
      router.push(redirect as any)
    }
  }, [redirect])

  async function fetchPosts() {
    const res = await authFetch("/api/posts/my-posts")
    const data: MyPostType[] = await res.json()
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["my-posts"] })
  }

  if (isPending) {
    return (
      <View style={styles.container}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={errorStyles.errorText}>Error loading posts. Please try again.</Text>
        <Pressable style={errorStyles.retryButton} onPress={refresh}>
          <Text style={errorStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Posts List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isPending} onRefresh={refresh} />}
      >
        {posts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No posts yet. Create one to get started!</Text>
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
  )
}

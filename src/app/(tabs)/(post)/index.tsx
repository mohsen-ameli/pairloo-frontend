import { authFetchAtom } from "@/src/utils/auth-fetch"
import { useSetAtom } from "jotai"
import { useRouter } from "expo-router"
import { Text, View, Image, ScrollView, RefreshControl, Pressable } from "react-native"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { styles } from "@/src/styles/feed.styles"
import { GeneralPostType } from "@/src/types/post.type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function Index() {
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const { data: posts, isError, isPending } = useQuery({ queryKey: ["feed"], queryFn: fetchPosts })

  async function fetchPosts() {
    const res = await authFetch("/api/posts/my-feed")
    const data: GeneralPostType[] = await res.json()

    // Masonry logic
    const numColumns = 2
    const columns: Array<typeof data> = Array.from({ length: numColumns }, () => [])
    data.forEach((post, idx) => {
      columns[idx % numColumns].push(post)
    })
    return columns
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["feed"] })
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
      <ScrollView
        contentContainerStyle={styles.feedContainer}
        refreshControl={<RefreshControl refreshing={isPending} onRefresh={refresh} />}
      >
        {posts.map((col, colIdx) => (
          <View key={colIdx} style={styles.column}>
            {col.map(post => (
              <Pressable
                key={post._id}
                style={styles.postCard}
                onPress={() => {
                  router.push({
                    pathname: "/feed-post",
                    params: { id: post._id },
                  })
                }}
              >
                <View style={styles.postHeader}>
                  <Image
                    source={
                      post.picture && post.picture.url
                        ? { uri: post.picture.url }
                        : defaultProfilePicture
                    }
                    style={styles.postHeaderImage}
                  />
                  <View style={styles.postHeaderTextContainer}>
                    <Text style={styles.postHeaderName}>
                      {post.firstName} {post.lastName}
                    </Text>
                    <Text style={styles.postUsername}>@{post.username}</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

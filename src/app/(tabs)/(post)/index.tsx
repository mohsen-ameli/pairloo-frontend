import { useSetAtom } from "jotai"
import { useRouter } from "expo-router"
import { Text, View, RefreshControl, Pressable, ActivityIndicator } from "react-native"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { styles } from "@/src/styles/feed.styles"
import { GeneralPostType } from "@/src/types/post.type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import { authFetchAtom } from "@/src/store/auth-store"
import { Image } from "expo-image"
import { colors } from "@/src/utils/colors"
import { FlashList } from "@shopify/flash-list"
import { sinceNow } from "@/src/utils/format-date"
// @ts-ignore: Multi-platform file import
import FeedAdView from "@/src/components/FeedAdView"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function Index() {
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const { data: posts, isError, isPending } = useQuery({ queryKey: ["feed"], queryFn: fetchPosts })

  async function fetchPosts() {
    const res = await authFetch("/api/posts/my-feed")
    const data: GeneralPostType[] = await res.json()

    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["feed"] })
  }

  async function loadMore() {}

  async function handlePostPress(postId: string) {
    router.push({
      pathname: "/feed-post",
      params: { feedPostId: postId },
    })

    try {
      await authFetch("/api/posts/interaction", {
        method: "POST",
        body: JSON.stringify({ postId, type: "post_view" }),
      })
    } catch (error) {
      console.error("Error recording post view interaction:", error)
    }
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
    <FlashList
      data={posts}
      style={styles.listStyles}
      contentContainerStyle={styles.listContainerStyles}
      refreshControl={<RefreshControl refreshing={isPending} onRefresh={refresh} />}
      onEndReached={loadMore}
      keyExtractor={item => item._id}
      renderItem={({ item: post, index }) => (
        <View key={post._id}>
          {index % 7 === 6 && <FeedAdView />}
          <Pressable style={styles.postCard} onPress={() => handlePostPress(post._id)}>
            <View style={styles.postHeader}>
              <Image
                source={post.picture ? { uri: post.picture } : defaultProfilePicture}
                style={styles.postHeaderImage}
              />
              <View style={styles.postHeaderTextContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.postHeaderName} numberOfLines={1}>
                    {post.firstName} {post.lastName}
                  </Text>
                  <Text style={styles.postUsername}>
                    {"• "}
                    {sinceNow(post.createdAt.toString())} ago
                  </Text>
                </View>
                <Text style={styles.postUsername} numberOfLines={1}>
                  @{post.username}
                </Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.title}</Text>
            {post.images && post.images.length > 0 ? (
              <View style={styles.postImageContainer}>
                <Image
                  source={{ uri: post.images[0] }}
                  style={styles.postImage}
                  contentFit="cover"
                />
              </View>
            ) : (
              <Text style={styles.descriptionStyle} numberOfLines={3}>
                {post.description}
              </Text>
            )}
          </Pressable>
        </View>
      )}
      ListFooterComponent={
        <ActivityIndicator size="large" color={colors.blue} style={{ marginVertical: 20 }} />
      }
    />
  )
}

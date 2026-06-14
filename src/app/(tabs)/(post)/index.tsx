import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useRouter } from "expo-router"
import { Text, View, RefreshControl, Pressable, ActivityIndicator } from "react-native"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { styles } from "@/src/styles/feed.styles"
import { GeneralPostType } from "@/src/types/post.type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { authFetchAtom, userAtom } from "@/src/store/auth-store"
import { Image } from "expo-image"
import { colors } from "@/src/utils/colors"
import { FlashList } from "@shopify/flash-list"
import { sinceNow } from "@/src/utils/format-date"
// @ts-ignore: Multi-platform file import
import FeedAdView from "@/src/components/FeedAdView"
import { commonStyles } from "@/src/styles/common.styles"
import { useEffect } from "react"
import Toast from "react-native-toast-message"
import { greetAtom } from "@/src/store/general-store"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function Index() {
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const { data: posts, isError, isPending } = useQuery({ queryKey: ["feed"], queryFn: fetchPosts })
  const user = useAtomValue(userAtom)
  const [greet, setGreet] = useAtom(greetAtom)

  // Greet the user
  useEffect(() => {
    if (!user || !greet) return

    Toast.show({
      type: "success",
      text1: "Welcome back, " + user.username + "!",
      text1Style: { fontSize: 16, fontWeight: "bold" },
      position: "top",
      visibilityTime: 3000,
    })
    setGreet(false)
  }, [greet, user])

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
      <View style={commonStyles.generalContainer}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={commonStyles.errorText}>Error loading posts. Please try again.</Text>
        <Pressable style={commonStyles.retryButton} onPress={refresh}>
          <Text style={commonStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <FlashList
      data={posts}
      style={commonStyles.generalContainer}
      contentContainerStyle={commonStyles.container}
      refreshControl={<RefreshControl refreshing={isPending} onRefresh={refresh} />}
      onEndReached={loadMore}
      keyExtractor={item => item._id}
      renderItem={({ item: post, index }) => (
        <View key={post._id}>
          {index % 7 === 6 && <FeedAdView />}
          <Pressable style={commonStyles.card} onPress={() => handlePostPress(post._id)}>
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
              <View style={commonStyles.cardImageContainer}>
                <Image
                  source={{ uri: post.images[0] }}
                  style={commonStyles.cardImage}
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

import { authFetchAtom } from "@/src/utils/auth-fetch"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { ScrollView, Text, View, TouchableOpacity, RefreshControl, Pressable } from "react-native"
import { styles } from "@/src/styles/index.styles"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import CustomLabel from "@/src/components/CustomLabel"
import { MyPosts } from "@/src/types/post.type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import { colors } from "@/src/utils/colors"
import { getScoreColor } from "@/src/utils/getScoreColor"
import { formatDate } from "@/src/utils/format-date"

export default function Index() {
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const {
    data: posts,
    isError,
    isPending,
  } = useQuery({ queryKey: ["my-posts"], queryFn: fetchPosts })

  async function fetchPosts() {
    const res = await authFetch("/api/posts/my-posts")
    const data: MyPosts[] = await res.json()
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
          posts.map((post, index) => {
            // Extract [object] from nested image array
            let flatImages = post.images || []
            if (flatImages.length > 0 && Array.isArray(flatImages[0])) {
              flatImages = flatImages.flat()
            }

            return (
              <TouchableOpacity
                key={index}
                style={styles.postCard}
                onPress={() => {
                  if (post.isDraft) {
                    router.push({
                      pathname: "/create-post",
                    })
                  } else {
                    router.push({
                      pathname: "my-post",
                      params: { id: post._id },
                    })
                  }
                }}
              >
                {flatImages && flatImages.length > 0 && flatImages[0].url && (
                  <View style={styles.postCardImage}>
                    <Image
                      source={{ uri: flatImages[0].url }}
                      style={styles.postCardImageFill}
                      contentFit="cover"
                    />
                  </View>
                )}

                <View style={styles.postCardContent}>
                  <Text style={styles.postTitle} numberOfLines={2}>
                    {post.title || post.content}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
                      {formatDate(post.createdAt)}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {post.closestPosts && post.closestPosts.length > 0 && (
                        <CustomLabel
                          text={`${Math.round(post.closestPosts[0].score * 100)}% match`}
                          backgroundColor={getScoreColor(post.closestPosts[0].score)}
                        />
                      )}
                      {post.isDraft && <CustomLabel text="Draft" backgroundColor={colors.purple} />}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

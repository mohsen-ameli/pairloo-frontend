import { authFetchAtom } from "@/src/utils/auth-fetch"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useAtomValue, useSetAtom } from "jotai"
import { ScrollView, Text, View, RefreshControl, Pressable, TouchableHighlight } from "react-native"
import { myPostStyles } from "@/src/styles/my-post.styles"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import CustomLabel from "@/src/components/CustomLabel"
import { MyPosts } from "@/src/types/post.type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import { colors } from "@/src/utils/colors"
import { getScoreColor } from "@/src/utils/getScoreColor"
import { formatDate } from "@/src/utils/format-date"
import { MyPostMenu } from "@/src/components/MyPostMenu"
import { loadingAtom } from "@/src/store/post-detail-store"

export default function Index() {
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const loading = useAtomValue(loadingAtom)
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

  if (isPending || loading) {
    return (
      <View style={myPostStyles.container}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.errorText}>Error loading posts. Please try again.</Text>
        <Pressable style={errorStyles.retryButton} onPress={refresh}>
          <Text style={errorStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={myPostStyles.container}>
      {/* Posts List */}
      <ScrollView
        contentContainerStyle={myPostStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={isPending} onRefresh={refresh} />}
      >
        {posts.length === 0 ? (
          <View style={myPostStyles.emptyStateContainer}>
            <Text style={myPostStyles.emptyStateText}>
              No posts yet. Create one to get started!
            </Text>
          </View>
        ) : (
          posts.map((post, index) => {
            return (
              <View key={post._id} style={{ position: "relative" }}>
                <TouchableHighlight
                  underlayColor={colors.lightGray}
                  key={index}
                  style={myPostStyles.postCard}
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
                  <View>
                    {post.images && post.images.length > 0 && (
                      <View style={myPostStyles.postCardImage}>
                        <Image
                          source={{ uri: post.images[0] }}
                          style={myPostStyles.postCardImageFill}
                          contentFit="cover"
                        />
                      </View>
                    )}

                    <View style={myPostStyles.postCardContent}>
                      <View style={myPostStyles.postCardHeader}>
                        <Text style={myPostStyles.postTitle} numberOfLines={2}>
                          {post.isDraft ? post.title || post.initialPostText : post.title}
                        </Text>
                        <TouchableHighlight>
                          <MyPostMenu id={post._id} />
                        </TouchableHighlight>
                      </View>

                      <View style={myPostStyles.postCardFooter}>
                        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
                          {formatDate(post.createdAt)}
                        </Text>
                        <View style={myPostStyles.postCardLabelContainer}>
                          {post.closestPosts && post.closestPosts.length > 0 && (
                            <CustomLabel
                              text={`${Math.round(post.closestPosts[0].score * 100)}% match`}
                              backgroundColor={getScoreColor(post.closestPosts[0].score)}
                            />
                          )}
                          {post.isDraft && (
                            <CustomLabel text="Draft" backgroundColor={colors.purple} />
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

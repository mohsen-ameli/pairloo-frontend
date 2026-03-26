import { useAtomValue, useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, TouchableHighlight, View } from "react-native"
import { Image } from "expo-image"
import { authFetchAtom, userAtom } from "@/src/store/auth-store"
import { styles } from "@/src/styles/settings.styles"
import { colors } from "@/src/utils/colors"
import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { resetEditAtom } from "@/src/store/settings-store"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import RatingStar from "@/src/components/RatingStar"
import { myPostStyles } from "@/src/styles/my-post.styles"
import { formatDate } from "@/src/utils/format-date"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MyPosts } from "@/src/types/post.type"
import { errorStyles } from "@/src/styles/error.styles"
import CustomLabel from "@/src/components/CustomLabel"
import { MyPostMenu } from "@/src/components/MyPostMenu"
import { getScoreColor } from "@/src/utils/getScoreColor"
import Feather from "@expo/vector-icons/Feather"

export default function ProfileScreen() {
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const resetEdit = useSetAtom(resetEditAtom)
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const [activeView, setActiveView] = useState<"posts" | "reviews">("posts")
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

  useEffect(() => {
    if (!user) return
    resetEdit()
  }, [user])

  if (!user) return null

  if (isPending) {
    return (
      <View style={myPostStyles.container}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.errorText}>Error loading profile. Please try again.</Text>
        <Pressable style={errorStyles.retryButton} onPress={refresh}>
          <Text style={errorStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 20,
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Image
          source={user.picture ? { uri: user.picture } : require("@/assets/images/default_pfp.png")}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 16,
          }}
        />
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={{ fontSize: 16, color: "gray" }}>@{user.username}</Text>
        <Text style={{ fontSize: 14, color: "gray" }}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </Text>

        {/* show following, followers, current rating */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            marginTop: 16,
          }}
        >
          <Text style={{ fontSize: 16, color: "gray" }}>Followers: {user.followersCount}</Text>
          <Text style={{ fontSize: 16, color: "gray" }}>Following: {user.followingCount}</Text>
          {user.ratingCount > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 16, color: "gray" }}>Rating: {user.ratingAvg}</Text>
              <RatingStar value={user.ratingAvg} />
            </View>
          )}
        </View>

        {/* Posts & Reviews show/hide buttons */}
        <View style={{ flexDirection: "row", marginTop: 26, marginBottom: 12, gap: 20 }}>
          <Pressable onPress={() => setActiveView("posts")}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: activeView === "posts" ? "bold" : "normal",
                color: activeView === "posts" ? colors.purple : "gray",
              }}
            >
              Posts
            </Text>
          </Pressable>
          <Pressable onPress={() => setActiveView("reviews")}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: activeView === "reviews" ? "bold" : "normal",
                color: activeView === "reviews" ? colors.purple : "gray",
              }}
            >
              Reviews
            </Text>
          </Pressable>
        </View>

        {/* Posts and reviews */}
        <View style={{ width: "100%" }}>
          {activeView === "posts" &&
            (posts.length === 0 ? (
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
                              {!post.publicPost && (
                                <CustomLabel backgroundColor={colors.shadow}>
                                  <Feather name="lock" size={12} color={colors.light} /> Private
                                </CustomLabel>
                              )}
                              {post.closestPosts && post.closestPosts.length > 0 && (
                                <CustomLabel
                                  backgroundColor={getScoreColor(post.closestPosts[0].score)}
                                >
                                  {Math.round(post.closestPosts[0].score * 100)}% match
                                </CustomLabel>
                              )}
                              {post.isDraft && (
                                <CustomLabel backgroundColor={colors.purple}>Draft</CustomLabel>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>
                )
              })
            ))}

          {activeView === "reviews" &&
            (user.reviews.length === 0 ? (
              <View style={myPostStyles.emptyStateContainer}>
                <Text style={myPostStyles.emptyStateText}>No reviews yet.</Text>
              </View>
            ) : (
              user.reviews.map(r => {
                return (
                  <View
                    key={r._id}
                    style={{
                      marginBottom: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 14,
                      backgroundColor: colors.lightGray,
                      borderRadius: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <RatingStar value={r.rating} />
                      <Text style={{ fontSize: 14, color: "gray" }}>{r.rating}/5</Text>
                    </View>
                    <Text style={{ fontSize: 14 }}>{r.review}</Text>
                  </View>
                )
              })
            ))}
        </View>
      </ScrollView>
    </View>
  )
}

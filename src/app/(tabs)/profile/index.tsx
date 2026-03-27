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
import { RatingStars, RatingStarSingle } from "@/src/components/RatingStar"
import { myPostStyles } from "@/src/styles/my-post.styles"
import { formatDate, formatDateDayMonthYear } from "@/src/utils/format-date"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import CustomLabel from "@/src/components/CustomLabel"
import { MyPostMenu } from "@/src/components/MyPostMenu"
import { getScoreColor } from "@/src/utils/getScoreColor"
import Feather from "@expo/vector-icons/Feather"
import { MyReviewsType, MySocialType } from "@/src/types/user.type"
import { MyPostType } from "@/src/types/post.type"

export default function ProfileScreen() {
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const resetEdit = useSetAtom(resetEditAtom)
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const [activeView, setActiveView] = useState<"posts" | "reviews">("posts")

  const {
    data: social,
    isError: isSocialError,
    isPending: isSocialPending,
  } = useQuery({ queryKey: ["my-social"], queryFn: fetchMySocial })

  async function fetchMySocial() {
    const res = await authFetch("/api/users/my-social")
    const data: MySocialType = await res.json()
    return data
  }

  const {
    data: reviews,
    isError: isReviewsError,
    isPending: isReviewsPending,
  } = useQuery({ queryKey: ["my-reviews"], queryFn: fetchMyReviews })

  async function fetchMyReviews() {
    const res = await authFetch("/api/users/my-reviews")
    const data: MyReviewsType = await res.json()
    return data
  }

  const {
    data: posts,
    isError: isPostsError,
    isPending: isPostsPending,
  } = useQuery({ queryKey: ["my-posts"], queryFn: fetchMyPosts })

  async function fetchMyPosts() {
    const res = await authFetch("/api/users/my-posts")
    const data: MyPostType[] = await res.json()
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["my-posts"] })
    queryClient.invalidateQueries({ queryKey: ["my-reviews"] })
    queryClient.invalidateQueries({ queryKey: ["my-social"] })
  }

  useEffect(() => {
    if (!user) return
    resetEdit()
  }, [user])

  if (!user) return null

  if (isPostsPending || isReviewsPending || isSocialPending) {
    return (
      <View style={myPostStyles.container}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isPostsError || isReviewsError || isSocialError) {
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
          backgroundColor: colors.light,
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
        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", color: colors.dark }}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={{ fontSize: 16, color: colors.gray }}>@{user.username}</Text>
        <Text style={{ fontSize: 14, color: colors.gray }}>
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
          <Text style={{ fontSize: 16, color: colors.gray }}>
            {social.followersCount} Followers
          </Text>
          <Text style={{ fontSize: 16, color: colors.gray }}>
            {social.followingCount} Following
          </Text>
          {reviews.ratingCount > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 16, color: colors.gray }}>{reviews.ratingAvg}</Text>
              <RatingStarSingle value={reviews.ratingAvg} />
              <Text style={{ fontSize: 16, color: colors.gray }}>Rating</Text>
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
                color: activeView === "posts" ? colors.purple : colors.gray,
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
                color: activeView === "reviews" ? colors.purple : colors.gray,
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
                              {formatDate(post.createdAt.toString())}
                            </Text>
                            <View style={myPostStyles.postCardLabelContainer}>
                              {!post.publicPost && (
                                <CustomLabel backgroundColor={colors.shadow}>
                                  <Feather name="lock" size={12} color={colors.light} />{" "}
                                  <Text style={{ color: colors.light, fontSize: 12 }}>Private</Text>
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
            (reviews.reviews.length === 0 ? (
              <View style={myPostStyles.emptyStateContainer}>
                <Text style={myPostStyles.emptyStateText}>No reviews yet.</Text>
              </View>
            ) : (
              reviews.reviews.map(r => {
                return (
                  <View
                    key={r.reviewer._id}
                    style={[
                      myPostStyles.postCard,
                      {
                        marginBottom: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 14,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Image
                        source={
                          r.reviewer.picture
                            ? { uri: r.reviewer.picture }
                            : require("@/assets/images/default_pfp.png")
                        }
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignSelf: "flex-start",
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              flexShrink: 1,
                              marginRight: 8,
                              color: colors.dark,
                            }}
                            numberOfLines={1}
                          >
                            {r.reviewer.firstName} {r.reviewer.lastName}
                          </Text>
                          <RatingStars value={r.rating} />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={{ fontSize: 12, color: colors.gray }}>
                            @{r.reviewer.username}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.gray }}>
                            {formatDateDayMonthYear(r.createdAt.toString())}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 14, marginTop: 10, color: colors.dark }}>
                          {r.review}
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              })
            ))}
        </View>
      </ScrollView>
    </View>
  )
}

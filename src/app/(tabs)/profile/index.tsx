import { useAtomValue, useSetAtom } from "jotai"
import {
  Pressable,
  ScrollView,
  Text,
  TouchableHighlight,
  View,
  Animated,
  ActivityIndicator,
} from "react-native"
import { Image } from "expo-image"
import { authFetchAtom, userAtom, userSecureAtom } from "@/src/store/auth-store"
import { colors } from "@/src/utils/colors"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "expo-router"
import { resetEditAtom } from "@/src/store/settings-store"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { RatingStars, RatingStarSingle } from "@/src/components/RatingStar"
import { formatDate, formatDateDayMonthYear } from "@/src/utils/format-date"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import CustomLabel from "@/src/components/CustomLabel"
import { MyPostMenu } from "@/src/components/MyPostMenu"
import { getScoreColor } from "@/src/utils/get-color"
import Feather from "@expo/vector-icons/Feather"
import { MyUserType, ReviewsType } from "@/src/types/user.type"
import { MyPostType, GeneralPostType } from "@/src/types/post.type"
import { profileStyles } from "@/src/styles/profile.styles"
import { savedPostIdsAtom, unsavePostAtom } from "@/src/store/post-detail-store"
import { getStatusColor } from "@/src/utils/get-color"
import { commonStyles } from "@/src/styles/common.styles"

export default function ProfileScreen() {
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const userSecure = useAtomValue(userSecureAtom)
  const resetEdit = useSetAtom(resetEditAtom)
  const authFetch = useSetAtom(authFetchAtom)
  const setSavedPostIds = useSetAtom(savedPostIdsAtom)
  const unsavePost = useSetAtom(unsavePostAtom)
  const queryClient = useQueryClient()
  const [activeView, setActiveView] = useState<"posts" | "reviews" | "savedPosts">("posts")
  const [containerWidth, setContainerWidth] = useState(0)
  const slideAnim = useRef(new Animated.Value(0)).current

  const {
    data: myUser,
    isError: isMyUserError,
    isPending: isMyUserPending,
  } = useQuery({ queryKey: ["my-user"], queryFn: fetchMyUser })

  async function fetchMyUser() {
    const res = await authFetch("/api/users/my-user/")
    const data: MyUserType = await res.json()
    return data
  }

  const {
    data: reviews,
    isError: isReviewsError,
    isPending: isReviewsPending,
  } = useQuery({ queryKey: ["reviews", userSecure?._id], queryFn: fetchMyReviews })

  async function fetchMyReviews() {
    const res = await authFetch("/api/users/reviews/" + userSecure?._id)
    const data: ReviewsType = await res.json()
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

  const {
    data: savedPosts,
    isError: isSavedPostsError,
    isPending: isSavedPostsPending,
  } = useQuery({
    queryKey: ["my-saved-posts"],
    queryFn: fetchSavedPosts,
    enabled: activeView === "savedPosts",
  })

  async function fetchSavedPosts() {
    const res = await authFetch("/api/users/my-saved-posts")
    const data: GeneralPostType[] = await res.json()
    setSavedPostIds(data.map(post => post._id))
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["my-posts"] })
    queryClient.invalidateQueries({ queryKey: ["reviews", userSecure?._id] })
    queryClient.invalidateQueries({ queryKey: ["my-saved-posts"] })
  }

  useEffect(() => {
    if (!user) return
    resetEdit()
  }, [user])

  useEffect(() => {
    const tabIndex = activeView === "posts" ? 0 : activeView === "reviews" ? 1 : 2
    const tabWidth = containerWidth / 3
    Animated.timing(slideAnim, {
      toValue: tabIndex * tabWidth,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [activeView, slideAnim, containerWidth])

  if (!user) return null

  if (isPostsPending || isReviewsPending || isMyUserPending) {
    return (
      <View style={commonStyles.generalContainer}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isPostsError || isReviewsError || isMyUserError || !myUser || !reviews) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={commonStyles.errorText}>Error loading profile. Please try again.</Text>
        <Pressable style={commonStyles.retryButton} onPress={refresh}>
          <Text style={commonStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={commonStyles.generalContainer}>
      <ScrollView contentContainerStyle={commonStyles.container}>
        <View style={profileStyles.headerContainer}>
          <Image
            source={
              user.picture ? { uri: user.picture } : require("@/assets/images/default_pfp.png")
            }
            style={profileStyles.profileImage}
          />
          <Text style={profileStyles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={profileStyles.text}>@{user.username}</Text>
          <Text style={profileStyles.textMd}>
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* show following, followers, current rating */}
        <View style={profileStyles.socialContainer}>
          <Pressable
            style={profileStyles.socialPressable}
            onPress={() =>
              router.push({
                pathname: "(details)/social-list",
                params: { type: "followers", id: userSecure?._id, username: user.username },
              })
            }
          >
            <Text style={profileStyles.socialPressableCount}>{myUser.followersCount}</Text>
            <Text style={profileStyles.socialPressableLabel}>Followers</Text>
          </Pressable>
          <Pressable
            style={profileStyles.socialPressable}
            onPress={() =>
              router.push({
                pathname: "(details)/social-list",
                params: { type: "following", id: userSecure?._id, username: user.username },
              })
            }
          >
            <Text style={profileStyles.socialPressableCount}>{myUser.followingCount}</Text>
            <Text style={profileStyles.socialPressableLabel}>Following</Text>
          </Pressable>
          {reviews.ratingCount > 0 && (
            <View style={profileStyles.ratingContainer}>
              <View style={profileStyles.ratingValueRow}>
                <Text style={profileStyles.text}>{reviews.ratingAvg}</Text>
                <RatingStarSingle value={reviews.ratingAvg} />
              </View>
              <Text style={profileStyles.socialPressableLabel}>Rating</Text>
            </View>
          )}
        </View>

        {/* Posts & Reviews show/hide buttons */}
        <View
          style={profileStyles.actionContainer}
          onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[profileStyles.actionTabAnimation, { transform: [{ translateX: slideAnim }] }]}
          />
          <Pressable style={profileStyles.profileTab} onPress={() => setActiveView("posts")}>
            <Text
              style={activeView === "posts" ? profileStyles.activeTab : profileStyles.nonActiveTab}
            >
              My Posts
            </Text>
          </Pressable>
          <Pressable style={profileStyles.profileTab} onPress={() => setActiveView("reviews")}>
            <Text
              style={
                activeView === "reviews" ? profileStyles.activeTab : profileStyles.nonActiveTab
              }
            >
              My Reviews
            </Text>
          </Pressable>
          <Pressable style={profileStyles.profileTab} onPress={() => setActiveView("savedPosts")}>
            <Text
              style={
                activeView === "savedPosts" ? profileStyles.activeTab : profileStyles.nonActiveTab
              }
            >
              Saved Posts
            </Text>
          </Pressable>
        </View>

        {/* Posts and reviews */}
        <View style={{ width: "100%" }}>
          {activeView === "posts" &&
            (posts.length === 0 ? (
              <View style={profileStyles.emptyStateContainer}>
                <Text style={profileStyles.emptyStateText}>
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
                      style={commonStyles.card}
                      onPress={() => {
                        if (post.status === "draft") {
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
                          <View style={commonStyles.cardImageContainer}>
                            <Image
                              source={{ uri: post.images[0] }}
                              style={commonStyles.cardImage}
                              contentFit="cover"
                            />
                          </View>
                        )}

                        <View style={profileStyles.postCardContent}>
                          <View style={profileStyles.postCardHeader}>
                            <Text style={profileStyles.postTitle} numberOfLines={2}>
                              {post.title?.trim() || "Untitled draft"}
                            </Text>
                            <TouchableHighlight>
                              <MyPostMenu id={post._id} />
                            </TouchableHighlight>
                          </View>

                          <View style={profileStyles.postCardFooter}>
                            <Text style={profileStyles.postDate}>
                              {formatDate(post.createdAt.toString())}
                            </Text>
                            <View style={profileStyles.postCardLabelContainer}>
                              {post.status !== "active" && (
                                <CustomLabel backgroundColor={getStatusColor(post.status)}>
                                  <Text style={{ textTransform: "capitalize" }}>{post.status}</Text>
                                </CustomLabel>
                              )}
                              {post.status !== "draft" && (
                                <>
                                  {!post.publicPost && (
                                    <CustomLabel backgroundColor={colors.shadow}>
                                      <Feather name="lock" size={12} color={colors.light} />{" "}
                                      <Text style={profileStyles.privatePostText}>Private</Text>
                                    </CustomLabel>
                                  )}
                                  {post.closestPosts && post.closestPosts.length > 0 ? (
                                    <CustomLabel
                                      backgroundColor={getScoreColor(post.closestPosts[0].score)}
                                    >
                                      {Math.round(post.closestPosts[0].score * 100)}% match
                                    </CustomLabel>
                                  ) : (
                                    <CustomLabel backgroundColor={getScoreColor(0)}>
                                      No match
                                    </CustomLabel>
                                  )}
                                </>
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
              <View style={profileStyles.emptyStateContainer}>
                <Text style={profileStyles.emptyStateText}>No reviews yet.</Text>
              </View>
            ) : (
              reviews.reviews.map(r => {
                return (
                  <View
                    key={r.reviewer._id}
                    style={[
                      commonStyles.card,
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 14,
                      },
                    ]}
                  >
                    <View style={profileStyles.reviewContainer}>
                      <Image
                        source={
                          r.reviewer.picture
                            ? { uri: r.reviewer.picture }
                            : require("@/assets/images/default_pfp.png")
                        }
                        style={profileStyles.reviewerImage}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={profileStyles.rowContainer}>
                          <Text style={profileStyles.reviewerName} numberOfLines={1}>
                            {r.reviewer.firstName} {r.reviewer.lastName}
                          </Text>
                          <RatingStars value={r.rating} />
                        </View>
                        <View style={profileStyles.rowContainer}>
                          <Text style={profileStyles.textSm}>@{r.reviewer.username}</Text>
                          <Text style={profileStyles.textSm}>
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

          {activeView === "savedPosts" &&
            (isSavedPostsPending ? (
              <ActivityIndicator size="large" color={colors.blue} />
            ) : isSavedPostsError || !savedPosts || !Array.isArray(savedPosts) ? (
              <View style={profileStyles.emptyStateContainer}>
                <Text style={profileStyles.emptyStateText}>
                  Error loading saved posts. Please try again.
                </Text>
              </View>
            ) : savedPosts.length === 0 ? (
              <View style={profileStyles.emptyStateContainer}>
                <Text style={profileStyles.emptyStateText}>
                  No saved posts yet. Save posts to view them here!
                </Text>
              </View>
            ) : (
              savedPosts.map(post => {
                return (
                  <View key={post._id}>
                    <TouchableHighlight
                      underlayColor={colors.lightGray}
                      style={commonStyles.card}
                      onPress={() => {
                        router.push({
                          pathname: "(details)/feed-post",
                          params: { feedPostId: post._id },
                        })
                      }}
                    >
                      <View>
                        {post.images && post.images.length > 0 && (
                          <View style={commonStyles.cardImageContainer}>
                            <Image
                              source={{ uri: post.images[0] }}
                              style={commonStyles.cardImage}
                              contentFit="cover"
                            />
                          </View>
                        )}

                        <View style={profileStyles.postCardContent}>
                          <View style={profileStyles.postCardHeader}>
                            <Text style={profileStyles.postTitle} numberOfLines={2}>
                              {post.title}
                            </Text>
                          </View>

                          <View style={profileStyles.postCardFooter}>
                            <Text style={{ fontSize: 12, color: colors.muted }}>
                              {formatDateDayMonthYear(post.createdAt.toString())}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              {post.status !== "active" && (
                                <CustomLabel backgroundColor={getStatusColor(post.status)}>
                                  <Text style={{ textTransform: "capitalize" }}>{post.status}</Text>
                                </CustomLabel>
                              )}
                              <Pressable
                                onPress={async event => {
                                  event.stopPropagation()
                                  unsavePost(post._id)
                                }}
                                style={{ padding: 4 }}
                              >
                                <Feather name="trash-2" size={18} color={colors.muted} />
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>
                )
              })
            ))}
        </View>
      </ScrollView>
    </View>
  )
}

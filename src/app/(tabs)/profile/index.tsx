import { useAtomValue, useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, TouchableHighlight, View } from "react-native"
import { Image } from "expo-image"
import { authFetchAtom, userAtom } from "@/src/store/auth-store"
import { colors } from "@/src/utils/colors"
import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { resetEditAtom } from "@/src/store/settings-store"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { RatingStars, RatingStarSingle } from "@/src/components/RatingStar"
import { formatDate, formatDateDayMonthYear } from "@/src/utils/format-date"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import CustomLabel from "@/src/components/CustomLabel"
import { MyPostMenu } from "@/src/components/MyPostMenu"
import { getScoreColor } from "@/src/utils/getScoreColor"
import Feather from "@expo/vector-icons/Feather"
import { MyReviewsType, MySocialType } from "@/src/types/user.type"
import { MyPostType } from "@/src/types/post.type"
import { profileStyles } from "@/src/styles/profile.styles"

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
      <View style={profileStyles.generalContainer}>
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
    <View style={profileStyles.generalContainer}>
      <ScrollView contentContainerStyle={profileStyles.container}>
        <Image
          source={user.picture ? { uri: user.picture } : require("@/assets/images/default_pfp.png")}
          style={profileStyles.profileImage}
        />
        <Text style={profileStyles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={profileStyles.text}>@{user.username}</Text>
        <Text style={profileStyles.textMd}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </Text>

        {/* show following, followers, current rating */}
        <View style={profileStyles.socialContainer}>
          <Text style={profileStyles.text}>{social.followersCount} Followers</Text>
          <Text style={profileStyles.text}>{social.followingCount} Following</Text>
          {reviews.ratingCount > 0 && (
            <View style={profileStyles.ratingContainer}>
              <Text style={profileStyles.text}>{reviews.ratingAvg}</Text>
              <RatingStarSingle value={reviews.ratingAvg} />
              <Text style={profileStyles.text}>Rating</Text>
            </View>
          )}
        </View>

        {/* Posts & Reviews show/hide buttons */}
        <View style={profileStyles.actionContainer}>
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
                      style={profileStyles.postCard}
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
                          <View style={profileStyles.postCardImage}>
                            <Image
                              source={{ uri: post.images[0] }}
                              style={profileStyles.postCardImageFill}
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
                              {post.isDraft ? (
                                <CustomLabel backgroundColor={colors.purple}>Draft</CustomLabel>
                              ) : (
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
                      profileStyles.postCard,
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
        </View>
      </ScrollView>
    </View>
  )
}

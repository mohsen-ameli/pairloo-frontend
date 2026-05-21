import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSetAtom, useAtomValue } from "jotai"
import { Pressable, ScrollView, Text, TouchableHighlight, View, Animated } from "react-native"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { GeneralUserProfileType, ReviewsType } from "@/src/types/user.type"
import { Image } from "expo-image"
import { colors } from "@/src/utils/colors"
import { useState, useRef, useEffect } from "react"
import { formatDateDayMonthYear } from "@/src/utils/format-date"
import { RatingStars, RatingStarSingle } from "@/src/components/RatingStar"
import { authFetchAtom, userSecureAtom } from "@/src/store/auth-store"
import { profileStyles } from "@/src/styles/profile.styles"
import CustomLabel from "@/src/components/CustomLabel"
import { getStatusColor } from "@/src/utils/get-color"
import { prepareChatAtom } from "@/src/store/chat-store"
import { chatSocketAtom } from "@/src/store/socket-store"
import { commonStyles } from "@/src/styles/common.styles"

export default function GeneralProfile() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const userSecure = useAtomValue(userSecureAtom)
  const prepareChat = useSetAtom(prepareChatAtom)
  const queryClient = useQueryClient()
  const { data, isError, isPending } = useQuery({
    queryKey: ["user-profile-" + id],
    queryFn: fetchProfile,
  })
  const [activeView, setActiveView] = useState<"posts" | "reviews">("posts")
  const [containerWidth, setContainerWidth] = useState(0)
  const socket = useAtomValue(chatSocketAtom)
  const slideAnim = useRef(new Animated.Value(0)).current

  async function mutateUser(action: "follow" | "unfollow") {
    const res = await authFetch("/api/users/" + action, {
      method: "POST",
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      throw new Error("Failed to follow user")
    }
    const data = await res.json()

    queryClient.invalidateQueries({ queryKey: ["user-profile-" + id] })
    queryClient.invalidateQueries({ queryKey: ["my-social"] })
    queryClient.invalidateQueries({ queryKey: ["my-user"] })
    queryClient.invalidateQueries({ queryKey: ["user-social", id] })
    queryClient.invalidateQueries({ queryKey: ["user-social", userSecure?._id] })

    return data
  }

  async function fetchProfile() {
    const res = await authFetch("/api/users/profile/" + id)
    const data: GeneralUserProfileType = await res.json()
    return data
  }

  const {
    data: reviews,
    isError: isReviewsError,
    isPending: isReviewsPending,
  } = useQuery({ queryKey: ["reviews", id], queryFn: fetchMyReviews })

  async function fetchMyReviews() {
    const res = await authFetch("/api/users/reviews/" + id)
    const data: ReviewsType = await res.json()
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["user-profile-" + id] })
    queryClient.invalidateQueries({ queryKey: ["reviews", id] })
  }

  function handleMessage() {
    if (!socket || !userSecure || !data) return
    socket.emit("newConversation", [userSecure._id, id])
    socket.once("conversation", conversation => {
      prepareChat()
      router.dismissTo({
        pathname: "/chat-details",
        params: { conversationId: conversation._id },
      })
    })
  }

  useEffect(() => {
    const tabIndex = activeView === "posts" ? 0 : 1
    const tabWidth = containerWidth / 2
    Animated.timing(slideAnim, {
      toValue: tabIndex * tabWidth,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [activeView, slideAnim, containerWidth])

  if (isPending || isReviewsPending) {
    return (
      <View style={commonStyles.generalContainer}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError || isReviewsError || !reviews || !data) {
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
    <View style={commonStyles.generalContainer}>
      <ScrollView contentContainerStyle={commonStyles.container}>
        {/* Top section for profile picture and username, firstname, lastname, date joined */}
        <View style={profileStyles.headerContainer}>
          <Image
            source={
              data.picture ? { uri: data.picture } : require("@/assets/images/default_pfp.png")
            }
            style={profileStyles.profileImage}
          />
          <Text style={profileStyles.name}>
            {data.firstName} {data.lastName}
          </Text>
          <Text style={profileStyles.text}>@{data.username}</Text>
          <Text style={profileStyles.textMd}>
            Joined {new Date(data.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* following, followers, current rating */}
        <View style={profileStyles.socialContainer}>
          <Pressable
            style={profileStyles.socialPressable}
            onPress={() =>
              router.push({
                pathname: "(details)/social-list",
                params: { type: "followers", id, username: data.username },
              })
            }
          >
            <Text style={profileStyles.socialPressableCount}>{data.followersCount}</Text>
            <Text style={profileStyles.socialPressableLabel}>Followers</Text>
          </Pressable>
          <Pressable
            style={profileStyles.socialPressable}
            onPress={() =>
              router.push({
                pathname: "(details)/social-list",
                params: { type: "following", id, username: data.username },
              })
            }
          >
            <Text style={profileStyles.socialPressableCount}>{data.followingCount}</Text>
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

        {/* Follow, unfollow buttons */}
        <View style={profileStyles.followContainer}>
          {userSecure?._id !== id && (
            <>
              {data.isFollowing ? (
                <Pressable
                  style={profileStyles.unfollowButton}
                  onPress={() => mutateUser("unfollow")}
                >
                  <Text style={{ color: colors.purple, fontSize: 16 }}>Unfollow</Text>
                </Pressable>
              ) : (
                <Pressable style={profileStyles.followButton} onPress={() => mutateUser("follow")}>
                  <Text style={{ color: "white", fontSize: 16 }}>Follow</Text>
                </Pressable>
              )}
              <Pressable style={profileStyles.followButton} onPress={handleMessage}>
                <Text style={{ color: "white", fontSize: 16 }}>Message</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Posts & Reviews show/hide buttons */}
        <View
          style={profileStyles.actionContainer}
          onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              profileStyles.actionTabAnimation,
              { width: "50%", transform: [{ translateX: slideAnim }] },
            ]}
          />
          <Pressable style={profileStyles.profileTab} onPress={() => setActiveView("posts")}>
            <Text
              style={activeView === "posts" ? profileStyles.activeTab : profileStyles.nonActiveTab}
            >
              Posts
            </Text>
          </Pressable>
          <Pressable style={profileStyles.profileTab} onPress={() => setActiveView("reviews")}>
            <Text
              style={
                activeView === "reviews" ? profileStyles.activeTab : profileStyles.nonActiveTab
              }
            >
              Reviews
            </Text>
          </Pressable>
        </View>

        {/* Posts and reviews */}
        <View style={{ width: "100%" }}>
          {activeView === "posts" &&
            (data.posts.length === 0 ? (
              <View style={profileStyles.emptyStateContainer}>
                <Text style={profileStyles.emptyStateText}>
                  No posts yet. Create one to get started!
                </Text>
              </View>
            ) : (
              data.posts.map(post => {
                return (
                  <View key={post._id}>
                    <TouchableHighlight
                      underlayColor={colors.lightGray}
                      key={post._id}
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
                            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
                              {formatDateDayMonthYear(post.createdAt.toString())}
                            </Text>
                            {post.status !== "active" && (
                              <CustomLabel backgroundColor={getStatusColor(post.status)}>
                                <Text style={{ textTransform: "capitalize" }}>{post.status}</Text>
                              </CustomLabel>
                            )}
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
                          <Text style={{ fontSize: 14, color: colors.gray }}>
                            @{r.reviewer.username}
                          </Text>
                          <Text style={{ fontSize: 14, marginTop: 4, color: colors.gray }}>
                            {formatDateDayMonthYear(r.createdAt.toString())}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 14, marginTop: 4, color: colors.dark }}>
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

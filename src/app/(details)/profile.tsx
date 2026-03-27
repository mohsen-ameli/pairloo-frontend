import { styles } from "@/src/styles/feed.styles"
import { errorStyles } from "@/src/styles/error.styles"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, TouchableHighlight, View } from "react-native"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { GeneralUserProfileType } from "@/src/types/user.type"
import { Image } from "expo-image"
import { colors } from "@/src/utils/colors"
import { myPostStyles } from "@/src/styles/my-post.styles"
import { useState } from "react"
import { formatDateDayMonthYear } from "@/src/utils/format-date"
import { RatingStars, RatingStarSingle } from "@/src/components/RatingStar"
import { authFetchAtom } from "@/src/store/auth-store"

export default function userProfile() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const { data, isError, isPending } = useQuery({
    queryKey: ["user-profile-" + id],
    queryFn: fetchPosts,
  })
  const [activeView, setActiveView] = useState<"posts" | "reviews">("reviews")

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

    return data
  }

  async function fetchPosts() {
    const res = await authFetch("/api/users/profile/" + id)
    const data: GeneralUserProfileType = await res.json()
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["user-profile-" + id] })
  }

  if (isPending) {
    return (
      <View style={styles.container}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError || !data) {
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
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 20,
          alignItems: "center",
          backgroundColor: colors.light,
        }}
      >
        {/* Top section for profile picture and username, firstname, lastname, date joined */}
        <Image
          source={data.picture ? { uri: data.picture } : require("@/assets/images/default_pfp.png")}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 16,
          }}
        />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.dark }}>
          {data.firstName} {data.lastName}
        </Text>
        <Text style={{ fontSize: 16, color: colors.gray }}>@{data.username}</Text>
        <Text style={{ fontSize: 14, color: colors.gray }}>
          Joined {new Date(data.createdAt).toLocaleDateString()}
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
          <Text style={{ fontSize: 16, color: colors.gray }}>{data.followersCount} Followers</Text>
          <Text style={{ fontSize: 16, color: colors.gray }}>{data.followingCount} Following</Text>
          {data.ratingCount > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 16, color: colors.gray }}>{data.ratingAvg}</Text>
              <RatingStarSingle value={data.ratingAvg} />
              <Text style={{ fontSize: 16, color: colors.gray }}>Rating</Text>
            </View>
          )}
        </View>

        {/* Follow, unfollow buttons */}
        <View style={{ flexDirection: "row", marginTop: 16 }}>
          {data.isFollowing ? (
            <Pressable
              style={{
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: colors.purple,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 4,
              }}
              onPress={() => mutateUser("unfollow")}
            >
              <Text style={{ color: colors.purple, fontSize: 16 }}>Unfollow</Text>
            </Pressable>
          ) : (
            <Pressable
              style={{
                backgroundColor: colors.purple,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 4,
                marginRight: 8,
              }}
              onPress={() => mutateUser("follow")}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Follow</Text>
            </Pressable>
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
            (data.posts.length === 0 ? (
              <View style={myPostStyles.emptyStateContainer}>
                <Text style={myPostStyles.emptyStateText}>
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
                      style={myPostStyles.postCard}
                      onPress={() => {
                        router.push({
                          pathname: "(details)/feed-post",
                          params: { id: post._id },
                        })
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
                              {post.title}
                            </Text>
                          </View>

                          <View style={myPostStyles.postCardFooter}>
                            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
                              {formatDateDayMonthYear(post.createdAt.toString())}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>
                )
              })
            ))}

          {activeView === "reviews" &&
            (data.reviews.length === 0 ? (
              <View style={myPostStyles.emptyStateContainer}>
                <Text style={myPostStyles.emptyStateText}>No reviews yet.</Text>
              </View>
            ) : (
              data.reviews.map(r => {
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

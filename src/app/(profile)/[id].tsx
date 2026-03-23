import { styles } from "@/src/styles/feed.styles"
import { errorStyles } from "@/src/styles/error.styles"
import { authFetchAtom } from "@/src/utils/auth-fetch"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocalSearchParams } from "expo-router"
import { useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, TouchableHighlight, View } from "react-native"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { UserProfileType } from "@/src/types/user.type"
import { Image } from "expo-image"
import { colors } from "@/src/utils/colors"
import Svg, { Path } from "react-native-svg"
import Ionicons from "@expo/vector-icons/Ionicons"
import { myPostStyles } from "@/src/styles/my-post.styles"
import { useState } from "react"

function StarOutline({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke={colors.purple}>
      <Path
        d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"
        strokeWidth={1}
      />
    </Svg>
  )
}

function Star({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={width} height={height} fill={colors.purple}>
      <Path d="m12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275L5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2z" />
    </Svg>
  )
}

function RatingStar({ value, max = 5, size = 18 }: { value: number; max?: number; size?: number }) {
  return (
    // <View style={{ width: size, height: size }}>
    //   <StarOutline width={size} height={size} />
    //   <View
    //     style={{
    //       position: "absolute",
    //       top: 0,
    //       left: 0,
    //       width: Math.floor((size * value) / (max + 0.8)),
    //       height: size,
    //     }}
    //   >
    //     <Star width={size} height={size} />
    //   </View>
    // </View>
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Ionicons name="star-outline" size={size} color={colors.purple} />

      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: Math.floor((size * value) / (max + 0.8)),
          height: size,
          overflow: "hidden",
        }}
      >
        <Ionicons name="star" size={size} color={colors.purple} />
      </View>
    </View>
  )
}

export default function userProfile() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const { data, isError, isPending } = useQuery({
    queryKey: ["user-profile-" + id],
    queryFn: fetchPosts,
  })
  const [activeView, setActiveView] = useState<"posts" | "reviews">("posts")

  async function mutateUser(action: "follow" | "unfollow") {
    const res = await authFetch("/api/users/" + action, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) {
      throw new Error("Failed to follow user")
    }
    const data = await res.json()
    queryClient.invalidateQueries({ queryKey: ["user-profile-" + id] })
    return data
  }

  async function fetchPosts() {
    const res = await authFetch("/api/users/profile/" + id)
    const data: UserProfileType = await res.json()
    console.log(JSON.stringify(data, null, 2))
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
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 20,
        alignItems: "center",
      }}
      style={{ flex: 1, width: "100%" }}
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
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {data.firstName} {data.lastName}
      </Text>
      <Text style={{ fontSize: 16, color: "gray" }}>@{data.username}</Text>
      <Text style={{ fontSize: 14, color: "gray" }}>
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
        <Text style={{ fontSize: 16, color: "gray" }}>Followers: {data.followersCount}</Text>
        <Text style={{ fontSize: 16, color: "gray" }}>Following: {data.followingCount}</Text>
        {data.ratingCount > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 16, color: "gray" }}>Rating: {data.ratingAvg}</Text>
            <RatingStar value={data.ratingAvg} />
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
      <View style={{ flexDirection: "row", marginTop: 24, gap: 16 }}>
        <Pressable onPress={() => setActiveView("posts")}>
          <Text
            style={{
              fontSize: 16,
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
              fontSize: 16,
              fontWeight: activeView === "reviews" ? "bold" : "normal",
              color: activeView === "reviews" ? colors.purple : "gray",
            }}
          >
            Reviews
          </Text>
        </Pressable>
      </View>

      <View style={{ width: "100%" }}>
        {activeView === "posts" && data.posts.length === 0 ? (
          <View style={myPostStyles.emptyStateContainer}>
            <Text style={myPostStyles.emptyStateText}>
              No posts yet. Create one to get started!
            </Text>
          </View>
        ) : (
          data.posts.map((post, index) => {
            return (
              <View key={post._id}>
                <TouchableHighlight
                  underlayColor={colors.lightGray}
                  key={index}
                  style={myPostStyles.postCard}
                  onPress={() => {
                    // if (post.isDraft) {
                    //   router.push({
                    //     pathname: "/create-post",
                    //   })
                    // } else {
                    //   router.push({
                    //     pathname: "my-post",
                    //     params: { id: post._id },
                    //   })
                    // }
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
                        {/* <TouchableHighlight>
                                <MyPostMenu id={post._id} />
                              </TouchableHighlight> */}
                      </View>

                      <View style={myPostStyles.postCardFooter}>
                        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
                          {/* {formatDate(post.createdAt.toString())} */}
                        </Text>
                        {/* <View style={myPostStyles.postCardLabelContainer}>
                                {post.closestPosts && post.closestPosts.length > 0 && (
                                  <CustomLabel
                                    text={`${Math.round(post.closestPosts[0].score * 100)}% match`}
                                    backgroundColor={getScoreColor(post.closestPosts[0].score)}
                                  />
                                )}
                                {post.isDraft && (
                                  <CustomLabel text="Draft" backgroundColor={colors.purple} />
                                )}
                              </View> */}
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            )
          })
        )}

        {activeView === "reviews" && data.posts.length === 0 ? (
          <View style={myPostStyles.emptyStateContainer}>
            <Text style={myPostStyles.emptyStateText}>No reviews yet.</Text>
          </View>
        ) : (
          data.reviews.map((r, index) => {
            return (
              <View
                key={r._id}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  backgroundColor: colors.lightGray,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 }}
                >
                  <RatingStar value={r.rating} />
                  <Text style={{ fontSize: 14, color: "gray" }}>{r.rating}/5</Text>
                </View>
                <Text style={{ fontSize: 14 }}>{r.review}</Text>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}

{
  /* // {activeView === "posts" && (
        //   {data.reviews.length === 0 ? (
        //   <View style={myPostStyles.emptyStateContainer}>
        //     <Text style={myPostStyles.emptyStateText}>
        //       No reviews yet. Write one to share your thoughts!
        //     </Text>
        //   </View>
        // ) : (
        //   data.reviews.map((review, index) => {
        //     return (
        //       <View key={review._id} style={{ marginBottom: 16, padding: 12, backgroundColor: colors.lightGray, borderRadius: 8 }}>
        //         <Text style={{ fontSize: 16, fontWeight: "bold" }}>{review.postTitle}</Text>
        //         <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 }}>
        //           <RatingStar value={review.rating} />
        //           <Text style={{ fontSize: 14, color: "gray" }}>{review.rating}/5</Text>
        //         </View>
        //         <Text style={{ fontSize: 14 }}>{review.comment}</Text>
        //       </View>
        //     )
        //   })
        // ))} */
}

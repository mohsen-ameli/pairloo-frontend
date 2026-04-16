import { useRouter, useLocalSearchParams, Stack } from "expo-router"
import { View, Text, ScrollView, Pressable, Animated, Platform } from "react-native"
import { useState, useEffect, useRef } from "react"
import Feather from "@expo/vector-icons/Feather"
import styles from "@/src/styles/post-detail.styles"
import { useAtomValue, useSetAtom } from "jotai"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { MyPostType } from "@/src/types/post.type"
import { getScoreColor } from "@/src/utils/getScoreColor"
import ImageCarousel from "@/src/components/ImageCarousel"
import { Image } from "expo-image"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import useCustomHeader from "@/src/utils/useCustomHeader"
import CustomLabel from "@/src/components/CustomLabel"
import { colors } from "@/src/utils/colors"
import { loadingAtom } from "@/src/store/post-detail-store"
import { authFetchAtom } from "@/src/store/auth-store"
import { radiusMetersToZoom } from "@/src/utils/map-utils"
import { useExpoMaps } from "@/src/utils/useExpoMaps"
import MapUnavailable from "@/src/components/MapUnavailable"

export default function PostDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const { maps, isExpoGo, isLoading } = useExpoMaps()
  const [isQnaExpanded, setIsQnaExpanded] = useState(false)
  const loading = useAtomValue(loadingAtom)
  const animatedHeight = useRef(new Animated.Value(0)).current
  const {
    data: post,
    isError,
    isPending,
  } = useQuery({ queryKey: [`post-${id}`], queryFn: fetchPost })
  const GoogleMapView = maps?.GoogleMaps.View
  const AppleMapView = maps?.AppleMaps.View

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isQnaExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [isQnaExpanded, animatedHeight])

  const detailOptions = useCustomHeader("Details", true, false, false, true, id)

  async function fetchPost() {
    const res = await authFetch(`/api/posts/my-posts/${id}`)
    const data: MyPostType = await res.json()
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: [`post-${id}`] })
  }

  if (isPending || loading) {
    return (
      <>
        <Stack.Screen options={detailOptions} />
        <View style={styles.container}>
          <LoadingIndicator loading={true} />
        </View>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={detailOptions} />
        <View style={errorStyles.container}>
          <Text style={errorStyles.errorText}>Error loading posts. Please try again.</Text>
          <Pressable style={errorStyles.retryButton} onPress={refresh}>
            <Text style={errorStyles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={detailOptions} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.postContainer}>
            {post.images && post.images.length != 0 && <ImageCarousel images={post.images} />}
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{post.description}</Text>
          </View>

          {/* Location Map */}
          {post.location && (
            <View style={styles.mapContainer}>
              <View style={styles.mapFlexContainer} pointerEvents="none">
                {isLoading ? (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <LoadingIndicator loading={true} />
                  </View>
                ) : isExpoGo || !maps ? (
                  <MapUnavailable
                    title="Map preview unavailable in Expo Go"
                    description="This post still shows the location details, but native map rendering requires a development build."
                  />
                ) : Platform.OS === "android" && GoogleMapView ? (
                  <GoogleMapView
                    style={styles.mapFlexContainer}
                    cameraPosition={{
                      coordinates: {
                        latitude: post.location.latitude,
                        longitude: post.location.longitude,
                      },
                      zoom: post.distance
                        ? radiusMetersToZoom(post.distance, post.location.latitude)
                        : 12,
                    }}
                    uiSettings={{
                      zoomControlsEnabled: false,
                    }}
                  />
                ) : AppleMapView ? (
                  <AppleMapView
                    style={styles.mapFlexContainer}
                    cameraPosition={{
                      coordinates: {
                        latitude: post.location.latitude,
                        longitude: post.location.longitude,
                      },
                      zoom: post.distance
                        ? radiusMetersToZoom(post.distance, post.location.latitude)
                        : 12,
                    }}
                    uiSettings={{
                      myLocationButtonEnabled: false,
                    }}
                  />
                ) : (
                  <MapUnavailable
                    title="Map preview unavailable"
                    description="The native map view failed to load."
                  />
                )}
              </View>
              <View pointerEvents="none" style={styles.mapOverlayContainer}>
                <View style={styles.radiusCircle} />
              </View>
            </View>
          )}

          {/* QNA Information */}
          {post.qna && post.qna.length > 0 && (
            <View style={styles.qnaSection}>
              <Pressable
                style={styles.qnaCollapsibleHeader}
                onPress={() => setIsQnaExpanded(!isQnaExpanded)}
              >
                <Text style={styles.qnaHeaderText}>Questionnaire Response</Text>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: animatedHeight.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <Feather name="arrow-down" size={20} color={colors.darkGray} />
                </Animated.View>
              </Pressable>

              <Animated.View
                style={{
                  opacity: animatedHeight,
                  maxHeight: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }),
                  overflow: "hidden",
                }}
              >
                {post.qna.map((item, i) => (
                  <View key={item._id} style={styles.qnaCard}>
                    <View style={styles.qnaCardHeader}>
                      <Text style={styles.qnaCardQuestion}>
                        <Text style={styles.qnaLabel}>Q: </Text>
                        {item.question.question}
                      </Text>
                    </View>
                    <View style={styles.qnaCardAnswerSection}>
                      {item.answer.map(ans => (
                        <Text key={ans} style={styles.qnaCardAnswer}>
                          <Text style={styles.qnaLabel}>A: </Text>
                          {ans}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </Animated.View>
            </View>
          )}

          {/* Closest posts */}
          {post.closestPosts && post.closestPosts.length > 0 && (
            <View style={styles.closestPostsContainer}>
              <Text style={styles.closestPostsTitle}>Top Matches</Text>
              {post.closestPosts.map(post => (
                <Pressable
                  key={post.postId}
                  style={styles.closestPost}
                  onPress={() => {
                    router.push({
                      pathname: "/feed-post",
                      params: { id: post.postId },
                    })
                  }}
                >
                  <View style={styles.closestPostHeaderContainer}>
                    <View style={styles.closestPostHeader}>
                      {post.picture && (
                        <View style={styles.closestPostAvatar}>
                          <Image
                            source={{ uri: post.picture }}
                            style={styles.closestPostAvatarImage}
                          />
                        </View>
                      )}
                      <View style={styles.closestPostUserInfo}>
                        <Text style={styles.closestPostName}>
                          {post.firstName} {post.lastName}
                        </Text>
                        <Text style={styles.closestPostUsername}>@{post.username}</Text>
                      </View>
                    </View>
                    <CustomLabel backgroundColor={getScoreColor(post.score)}>
                      {Math.round(post.score * 100)}% match
                    </CustomLabel>
                  </View>
                  <View style={styles.closestPostImage}>
                    {post.images && post.images.length != 0 && (
                      <ImageCarousel images={post.images} widthOffset={23} />
                    )}
                  </View>
                  <View style={styles.closestPostItem}>
                    <Text style={styles.closestPostName}>{post.title}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </>
  )
}

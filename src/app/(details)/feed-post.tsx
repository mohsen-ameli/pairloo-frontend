import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { View, Text, ScrollView, Pressable, Platform, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { AppleMaps, GoogleMaps } from "expo-maps"
import styles from "@/src/styles/id.styles"
import { useAtomValue, useSetAtom } from "jotai"
import { authFetchAtom } from "@/src/utils/auth-fetch"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import CustomButton from "@/src/components/CustomButton"
import { GeneralPostType } from "@/src/types/post.type"
import ImageCarousel from "@/src/components/ImageCarousel"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import { userJwtAtom } from "@/src/store/auth-store"
import { ConversationType } from "@/src/types/chat.type"
import { chatSocketAtom } from "@/src/store/socket-store"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { colors } from "@/src/utils/colors"
import { sinceNow } from "@/src/utils/format-date"
import { useRef } from "react"
import { radiusMetersToZoom } from "@/src/utils/map-utils"

export default function PostDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const socket = useAtomValue(chatSocketAtom)
  const user = useAtomValue(userJwtAtom)
  const detailOptions = useCustomHeader("Details", true)
  const queryClient = useQueryClient()
  const androidMapRef = useRef(null)
  const appleMapRef = useRef(null)
  const {
    data: post,
    isError,
    isPending,
  } = useQuery({ queryKey: [`post-${id}`], queryFn: fetchPost })

  // console.log("Post map zoom:", post?.firstName, post?.location, post?.zoom)

  async function fetchPost() {
    const res = await authFetch(`/api/posts/${id}`)
    const data: GeneralPostType = await res.json()
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: [`post-${id}`] })
  }

  async function contactPoster() {
    if (!socket || !user || !post) return

    socket.emit("newConversation", [user._id, post._id])
    socket.once("conversation", async (conversation: ConversationType) => {
      router.push({
        pathname: "/chat-details",
        params: { id: conversation._id },
      })
    })
  }

  if (isPending) {
    return (
      <>
        <Stack.Screen options={detailOptions} />
        <LoadingIndicator loading={true} />
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
          {/* User Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 4,
            }}
          >
            {post.picture && (
              <Image
                source={{ uri: post.picture }}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
              />
            )}
            <View>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.dark }}>
                {post.firstName} {post.lastName}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>@{post.username}</Text>
            </View>
          </View>

          <Text style={styles.title}>{post.initialPostText}</Text>

          {post.images && post.images.length !== 0 && <ImageCarousel images={post.images} />}

          <Text style={styles.locationText}>Approximate Location</Text>

          {/* Location Map */}
          {post.location && (
            <View style={{ height: 280, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              <View style={{ flex: 1 }} pointerEvents="none">
                {Platform.OS === "android" ? (
                  <GoogleMaps.View
                    ref={androidMapRef}
                    style={{ flex: 1 }}
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
                ) : (
                  <AppleMaps.View
                    ref={appleMapRef}
                    style={{ flex: 1 }}
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
                )}
              </View>
              <View
                pointerEvents="none"
                style={{
                  ...StyleSheet.absoluteFillObject,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 250,
                    height: 250,
                    borderRadius: 150,
                    backgroundColor: "rgba(128, 0, 128, 0.2)",
                    borderColor: colors.purple,
                    borderWidth: 2,
                  }}
                />
              </View>
            </View>
          )}

          <Text style={{ fontSize: 12, color: colors.darkGray, marginLeft: 5, marginBottom: 16 }}>
            Post Created {sinceNow(post.createdAt)} Ago
          </Text>

          <View style={{ height: 20 }} />
        </ScrollView>
        <View style={{ paddingHorizontal: 16, marginBottom: 32, marginTop: 5 }}>
          <CustomButton onPress={contactPoster}>Contact Poster</CustomButton>
        </View>
      </View>
    </>
  )
}

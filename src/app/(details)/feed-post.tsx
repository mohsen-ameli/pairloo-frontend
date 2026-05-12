import { useLocalSearchParams, useRouter } from "expo-router"
import { View, Text, ScrollView, Pressable, Platform } from "react-native"
import { Image } from "expo-image"
import styles from "@/src/styles/post-detail.styles"
import { useAtomValue, useSetAtom } from "jotai"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import CustomButton from "@/src/components/CustomButton"
import CustomLabel from "@/src/components/CustomLabel"
import { GeneralPostType } from "@/src/types/post.type"
import ImageCarousel from "@/src/components/ImageCarousel"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import { authFetchAtom, userSecureAtom } from "@/src/store/auth-store"
import { ConversationType } from "@/src/types/socket/chat.type"
import { chatSocketAtom } from "@/src/store/socket-store"
import { sinceNow } from "@/src/utils/format-date"
import { radiusMetersToZoom } from "@/src/utils/map-utils"
import { useExpoMaps } from "@/src/utils/useExpoMaps"
import MapUnavailable from "@/src/components/MapUnavailable"
import { getStatusColor } from "@/src/utils/get-color"

export default function PostDetails() {
  const router = useRouter()
  const { feedPostId } = useLocalSearchParams<{ feedPostId: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const socket = useAtomValue(chatSocketAtom)
  const user = useAtomValue(userSecureAtom)
  const queryClient = useQueryClient()
  const { maps, isExpoGo, isLoading } = useExpoMaps()
  const {
    data: post,
    isError,
    isPending,
  } = useQuery({ queryKey: [`post-${feedPostId}`], queryFn: fetchPost })
  const GoogleMapView = maps?.GoogleMaps.View
  const AppleMapView = maps?.AppleMaps.View

  async function fetchPost() {
    const res = await authFetch(`/api/posts/${feedPostId}`)
    const data: GeneralPostType = await res.json()
    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: [`post-${feedPostId}`] })
  }

  async function contactPoster() {
    if (!socket || !user || !post) return

    socket.emit("newConversation", [user._id, post.userId])
    socket.once("conversation", (conversation: ConversationType) => {
      router.push({
        pathname: "/chat-details",
        params: { id: conversation._id },
      })
    })

    try {
      await authFetch("/api/posts/interaction", {
        method: "POST",
        body: JSON.stringify({ postId: post._id, type: "contact" }),
      })
    } catch (error) {
      console.error("Error recording contact interaction:", error)
    }
  }

  async function viewProfile() {
    if (!post) return

    router.push({
      pathname: "(details)/profile",
      params: { id: post.userId },
    })

    try {
      await authFetch("/api/posts/interaction", {
        method: "POST",
        body: JSON.stringify({ postId: post._id, type: "profile_view" }),
      })
    } catch (error) {
      console.error("Error recording profile view interaction:", error)
    }
  }

  if (isPending) {
    return (
      <View style={errorStyles.container}>
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.content}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={viewProfile} style={styles.headerContainer}>
          <Image
            source={
              post.picture ? { uri: post.picture } : require("@/assets/images/default_pfp.png")
            }
            style={styles.headerUserImage}
          />
          <View>
            <Text style={styles.headerUserName}>
              {post.firstName} {post.lastName}
            </Text>
            <Text style={styles.postUserUsername}>@{post.username}</Text>
          </View>
        </Pressable>

        <Text style={styles.title}>{post.title}</Text>
        {post.status === "inactive" && (
          <View style={styles.statusLabel}>
            <CustomLabel backgroundColor={getStatusColor(post.status)}>
              <Text style={{ textTransform: "capitalize" }}>{post.status}</Text>
            </CustomLabel>
          </View>
        )}
        <Text style={styles.description}>{post.description}</Text>

        {post.images && post.images.length !== 0 && <ImageCarousel images={post.images} />}

        {post.location && <Text style={styles.locationText}>Approximate Location</Text>}

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
                  description="This screen still works, but native map rendering requires a development build."
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

        <Text style={styles.timestampText}>Post Created {sinceNow(post.createdAt)} Ago</Text>
      </ScrollView>

      <View style={styles.contactButtonContainer}>
        <CustomButton onPress={contactPoster}>Contact Poster</CustomButton>
      </View>
    </View>
  )
}

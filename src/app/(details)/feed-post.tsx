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

import { authFetchAtom, userSecureAtom } from "@/src/store/auth-store"
import { chatSocketAtom } from "@/src/store/socket-store"
import { sinceNow } from "@/src/utils/format-date"
import { radiusMetersToZoom } from "@/src/utils/map-utils"
import { useExpoMaps } from "@/src/utils/useExpoMaps"
import MapUnavailable from "@/src/components/MapUnavailable"
import { getStatusColor } from "@/src/utils/get-color"
import { commonStyles } from "@/src/styles/common.styles"
import WebGoogleMap from "@/src/components/WebGoogleMap"

export default function PostDetails() {
  const router = useRouter()
  const { feedPostId } = useLocalSearchParams<{ feedPostId?: string }>()
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

    socket.emit("getConversation", user._id, [user._id, post.userId], post._id)

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
      pathname: "(details)/general-profile",
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
      <View style={commonStyles.generalContainer}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={commonStyles.errorText}>Error loading posts. Please try again.</Text>
        <Pressable style={commonStyles.retryButton} onPress={refresh}>
          <Text style={commonStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  if (!feedPostId || !post) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={commonStyles.errorText}>Post not found.</Text>
        <Pressable style={commonStyles.retryButton} onPress={() => router.back()}>
          <Text style={commonStyles.retryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={commonStyles.generalContainer}>
      <ScrollView
        contentContainerStyle={commonStyles.container}
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

        {post.images && post.images.length !== 0 && (
          <ImageCarousel pageType="view" images={post.images} />
        )}

        {post.location && <Text style={styles.locationText}>Approximate Location</Text>}

        {/* Location Map */}
        {post.location && (
          <View style={styles.mapContainer}>
            <View style={styles.mapFlexContainer}>
              {isLoading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <LoadingIndicator loading={true} />
                </View>
              ) : isExpoGo ? (
                <View style={{ flex: 1, paddingTop: 80 }}>
                  <MapUnavailable
                    title="Maps are unavailable in Expo Go"
                    description="Search for a city above to set your approximate location. The map picker requires a development build."
                  />
                </View>
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
              ) : Platform.OS === "ios" && AppleMapView ? (
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
              ) : Platform.OS === "web" ? (
                <WebGoogleMap
                  cameraPosition={{
                    coordinates: {
                      lat: post.location.latitude,
                      lng: post.location.longitude,
                    },
                    zoom: post.distance
                      ? radiusMetersToZoom(post.distance, post.location.latitude)
                      : 12,
                  }}
                  zoomControl={false}
                />
              ) : (
                !maps && (
                  <MapUnavailable
                    title="Map preview unavailable"
                    description="The native map view failed to load."
                  />
                )
              )}
            </View>
            <View style={styles.mapOverlayContainer}>
              <View style={styles.radiusCircle} />
            </View>
          </View>
        )}

        <Text style={styles.timestampText}>Post Created {sinceNow(post.createdAt)} Ago</Text>
      </ScrollView>

      <View style={commonStyles.floatingButton}>
        <CustomButton onPress={contactPoster}>Contact Poster</CustomButton>
      </View>
    </View>
  )
}

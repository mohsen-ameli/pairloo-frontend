import { useLocalSearchParams, useRouter } from "expo-router"
import { View, Text, ScrollView, Pressable, Platform, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { AppleMaps, GoogleMaps } from "expo-maps"
import styles from "@/src/styles/post-detail.styles"
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
import { colors } from "@/src/utils/colors"
import { sinceNow } from "@/src/utils/format-date"
import { useRef } from "react"
import { radiusMetersToZoom } from "@/src/utils/map-utils"
import Feather from "@expo/vector-icons/Feather"

export default function PostDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const socket = useAtomValue(chatSocketAtom)
  const user = useAtomValue(userJwtAtom)
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
        <Pressable
          onPress={() =>
            router.push({
              pathname: "(details)/profile",
              params: { id: post._id },
            })
          }
          style={styles.headerContainer}
        >
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

        <Text style={styles.title}>{post.initialPostText}</Text>

        {post.images && post.images.length !== 0 && <ImageCarousel images={post.images} />}

        {post.location && <Text style={styles.locationText}>Approximate Location</Text>}

        {/* Location Map */}
        {post.location && (
          <View style={styles.mapContainer}>
            <View style={styles.mapFlexContainer} pointerEvents="none">
              {Platform.OS === "android" ? (
                <GoogleMaps.View
                  ref={androidMapRef}
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
              ) : (
                <AppleMaps.View
                  ref={appleMapRef}
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

import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { View, Text, ScrollView, Pressable } from "react-native"
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

export default function PostDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const socket = useAtomValue(chatSocketAtom)
  const user = useAtomValue(userJwtAtom)
  const detailOptions = useCustomHeader("Details", true)
  const queryClient = useQueryClient()
  const {
    data: post,
    isError,
    isPending,
  } = useQuery({ queryKey: [`post-${id}`], queryFn: fetchPost })

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
          {post.images && post.images.length !== 0 && <ImageCarousel images={post.images} />}
          <Text style={styles.title}>{post.content}</Text>
          <Text style={styles.subtitle}>{post.summary}</Text>

          <View style={{ height: 20 }} />
        </ScrollView>
        <View style={{ paddingHorizontal: 16, marginBottom: 32, marginTop: 5 }}>
          <CustomButton onPress={contactPoster}>Contact Poster</CustomButton>
        </View>
      </View>
    </>
  )
}

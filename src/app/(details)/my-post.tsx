import { useRouter, useLocalSearchParams, Stack } from "expo-router"
import { View, Text, ScrollView, Alert, Pressable } from "react-native"
import styles from "@/src/styles/id.styles"
import { useSetAtom } from "jotai"
import { authFetchAtom } from "@/src/utils/auth-fetch"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import CustomButton from "@/src/components/CustomButton"
import { MyPostType } from "@/src/types/post.type"
import { getScoreColor } from "@/src/utils/getScoreColor"
import ImageCarousel from "@/src/components/ImageCarousel"
import { Image } from "expo-image"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import useCustomHeader from "@/src/utils/useCustomHeader"
import CustomLabel from "@/src/components/CustomLabel"

export default function PostDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const {
    data: post,
    isError,
    isPending,
  } = useQuery({ queryKey: [`post-${id}`], queryFn: fetchPost })
  const { mutate, isPending: isPendingMutation } = useMutation({
    mutationFn: deletePost,
  })

  const handleDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => mutate(),
      },
    ])
  }

  const handleEdit = () => {
    Alert.alert("Edit", "Edit Functionality Will Be Added Soon")
  }

  const detailOptions = useCustomHeader(
    "Details",
    true,
    false,
    false,
    true,
    handleDelete,
    handleEdit
  )

  async function fetchPost() {
    const res = await authFetch(`/api/posts/my-posts/${id}`)
    const data: MyPostType = await res.json()
    return data
  }

  async function deletePost() {
    const res = await authFetch(`/api/posts/${id}`, {
      method: "DELETE",
    })
    if (res.ok) {
      router.back()
      queryClient.invalidateQueries({ queryKey: ["my-posts"] })
    } else {
      Alert.alert("Error", "Could not remove post. Please try again later.")
    }
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: [`post-${id}`] })
  }

  if (isPending || isPendingMutation) {
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
        <View style={styles.container}>
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
            <Text style={styles.title}>{post.title || post.content}</Text>
          </View>

          {/* QNA Information */}
          {post.qna && post.qna.length > 0 && (
            <View style={styles.qnaSection}>
              <Text style={styles.description}>Your Q&A Response:</Text>
              {post.qna.map((item: any, index: number) => (
                <View key={item._id} style={styles.qnaCard}>
                  <View style={styles.qnaCardHeader}>
                    <Text style={styles.qnaCardQuestion}>
                      <Text style={styles.qnaLabel}>Q: </Text>
                      {item.question.question}
                    </Text>
                  </View>
                  <View style={styles.qnaCardAnswerSection}>
                    {Array.isArray(item.answer) ? (
                      item.answer.map((ans: any, idx: number) => (
                        <Text key={idx} style={styles.qnaCardAnswer}>
                          <Text style={styles.qnaLabel}>A: </Text>
                          {ans}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.qnaCardAnswer}>
                        <Text style={styles.qnaLabel}>A: </Text>
                        {item.answer}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Closest posts */}
          {post.closestPosts && post.closestPosts.length > 0 && (
            <View style={styles.closestPostsContainer}>
              <Text style={styles.closestPostsTitle}>Similar Posts:</Text>
              {post.closestPosts.map(post => (
                <View key={post._id} style={styles.closestPost}>
                  <View style={styles.closestPostHeaderContainer}>
                    <View style={styles.closestPostHeader}>
                      {post.picture && (
                        <View style={styles.closestPostAvatar}>
                          <Image
                            source={{ uri: post.picture.url }}
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
                    <CustomLabel
                      text={`${Math.round(parseFloat(post.score) * 100)}% match`}
                      backgroundColor={getScoreColor(parseFloat(post.score))}
                    />
                  </View>
                  <View style={styles.closestPostImage}>
                    {post.images && post.images.length != 0 && (
                      <ImageCarousel images={post.images} widthOffset={23} />
                    )}
                  </View>
                  <View style={styles.closestPostItem}>
                    <Text style={styles.closestPostName}>{post.content}</Text>
                  </View>
                  <CustomButton
                    onPress={() => {
                      router.push({
                        pathname: "/feed-post",
                        params: { id: post._id },
                      })
                    }}
                  >
                    View Post
                  </CustomButton>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </>
  )
}

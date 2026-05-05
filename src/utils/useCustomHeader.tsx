import { View, Text, TouchableOpacity, Pressable, Alert } from "react-native"
import React from "react"
import { styles } from "@/src/styles/header.styles"
import { Image } from "expo-image"
import { colors } from "@/src/utils/colors"
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient"
import { useAtomValue, useSetAtom } from "jotai"
import {
  discardDraftAtom,
  getNewQuestionAtom,
  loadingAtom,
  qnaAtom,
} from "@/src/store/create-post-store"
import Feather from "@expo/vector-icons/Feather"
import { useGlobalSearchParams, useRouter } from "expo-router"
import { currentConversationAtom } from "@/src/store/chat-store"
import { userSecureAtom } from "@/src/store/auth-store"
import { MyPostMenu } from "@/src/components/MyPostMenu"
import { currPageAtom, pageCountAtom } from "@/src/store/pager-store"
import { savePostAtom, unsavePostAtom, savedPostIdsAtom } from "@/src/store/post-detail-store"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function useCustomHeader({
  title,
  backButtonVisible = true,
  id = null,
  inChat = false,
  createPost = false,
  myPostsPage = false,
  isPostDetails = false,
  isProfile = false,
}: {
  title: string
  backButtonVisible?: boolean
  id?: string | null
  inChat?: boolean
  createPost?: boolean
  myPostsPage?: boolean
  isPostDetails?: boolean
  isProfile?: boolean
}): ExtendedStackNavigationOptions {
  const router = useRouter()

  let options: ExtendedStackNavigationOptions = {
    title,
    headerShown: true,
    headerBackVisible: false,
    headerBackButtonMenuEnabled: false,
    headerTintColor: colors.dark,
    headerBackButtonDisplayMode: "default",
    headerBackground() {
      return <View style={styles.headerBackground} />
    },
    headerTitle: () => (
      <View style={styles.header}>
        {backButtonVisible && (
          <Pressable
            style={styles.headerBackIcon}
            onPress={() => {
              router.back()
            }}
          >
            <Feather name="arrow-left" size={26} color={colors.dark} />
          </Pressable>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    ),
  }

  if (inChat) {
    return {
      ...options,
      headerTitle: () => <ChatHeader />,
    }
  }

  if (createPost) {
    return {
      ...options,
      headerTitle: () => <CreatePostHeader />,
    }
  }

  if (myPostsPage && id) {
    return {
      ...options,
      headerTitle: () => (
        <View style={styles.header}>
          <View
            style={[
              styles.headerContent,
              { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {backButtonVisible && (
                <Pressable
                  style={styles.headerBackIcon}
                  onPress={() => {
                    router.back()
                  }}
                >
                  <Feather name="arrow-left" size={26} color={colors.dark} />
                </Pressable>
              )}
              <Text style={[styles.headerTitle, { marginLeft: 50 }]}>{title}</Text>
            </View>
            <MyPostMenu id={id} />
          </View>
        </View>
      ),
    }
  }

  if (isPostDetails) {
    return {
      ...options,
      headerTitle: () => <PostDetailsHeader />,
    }
  }

  if (isProfile) {
    return {
      ...options,
      headerTitle: () => (
        <View
          style={[
            styles.header,
            { flexDirection: "row", justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={styles.headerTitle}>{title}</Text>
          <Pressable
            onPress={() => router.push("(tabs)/profile/settings")}
            style={{
              position: "absolute",
              top: 5,
              right: 10,
            }}
          >
            <Feather name="settings" size={24} color={colors.dark} />
          </Pressable>
        </View>
      ),
    }
  }

  return options
}

function ChatHeader() {
  const currentConversation = useAtomValue(currentConversationAtom)
  const user = useAtomValue(userSecureAtom)
  const router = useRouter()

  if (!currentConversation || !user) return <></>
  const otherUser = currentConversation.members.find(member => member._id !== user._id)
  if (!otherUser) return <></>

  return (
    <View style={styles.otherHeader}>
      <Pressable
        style={styles.headerBackIcon}
        onPress={() => {
          router.back()
        }}
      >
        <Feather name="arrow-left" size={26} color={colors.dark} />
      </Pressable>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "(details)/profile",
            params: { id: otherUser._id },
          })
        }
        style={styles.otherProfileButton}
      >
        <Image
          source={
            otherUser.picture && otherUser.picture
              ? { uri: otherUser.picture }
              : defaultProfilePicture
          }
          style={styles.otherProfileImage}
        />
        <Text style={styles.otherHeaderTitle}>{otherUser.username}</Text>
      </TouchableOpacity>
    </View>
  )
}

function CreatePostHeader() {
  const discardDraft = useSetAtom(discardDraftAtom)
  const getNewQuestion = useSetAtom(getNewQuestionAtom)
  const loading = useAtomValue(loadingAtom)
  const currPage = useAtomValue(currPageAtom)
  const pageCount = useAtomValue(pageCountAtom)
  const qna = useAtomValue(qnaAtom)

  return (
    <View style={styles.header}>
      <View
        style={[
          styles.headerContent,
          { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        ]}
      >
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {0 < currPage && currPage <= pageCount - 3 && qna[currPage].question.intention && (
            <Pressable onPress={getNewQuestion} disabled={loading} style={{ padding: 6 }}>
              <Feather name="rotate-ccw" size={24} color={colors.dark} />
            </Pressable>
          )}
          <Pressable onPress={discardDraft} disabled={loading} style={{ padding: 6 }}>
            <Feather name="trash-2" size={24} color={colors.dark} />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function PostDetailsHeader() {
  const router = useRouter()
  const { feedPostId } = useGlobalSearchParams<{ feedPostId: string }>()
  const savePost = useSetAtom(savePostAtom)
  const unsavePost = useSetAtom(unsavePostAtom)
  const savedPostIds = useAtomValue(savedPostIdsAtom)
  const isPostSaved = feedPostId ? savedPostIds.includes(feedPostId) : false

  return (
    <View style={styles.header}>
      <View
        style={[
          styles.headerContent,
          { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            style={styles.headerBackIcon}
            onPress={() => {
              router.back()
            }}
          >
            <Feather name="arrow-left" size={26} color={colors.dark} />
          </Pressable>
          <Text style={[styles.headerTitle, { marginLeft: 50 }]}>Post Details</Text>
        </View>
        <Pressable
          style={{ padding: 6 }}
          onPress={async () => {
            if (!feedPostId) {
              Alert.alert("Error", "Something went wrong. Post was not saved.")
              return
            }

            if (isPostSaved) {
              await unsavePost(feedPostId)
            } else {
              await savePost(feedPostId)
            }
          }}
        >
          {isPostSaved ? (
            <MaterialIcons name="bookmark" size={24} color={colors.purple} />
          ) : (
            <MaterialIcons name="bookmark-border" size={24} color={colors.dark} />
          )}
        </Pressable>
      </View>
    </View>
  )
}

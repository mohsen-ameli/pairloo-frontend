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
import { currPageAtom, pageCountAtom } from "@/src/store/pager-store"
import { savePostAtom, unsavePostAtom, savedPostIdsAtom } from "@/src/store/post-detail-store"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { MyPostMenu } from "../components/MyPostMenu"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function useCustomHeader({
  title,
  postId,
  inChat = false,
  createPost = false,
  isPostDetails = false,
  isMyPostDetails = false,
  isProfile = false,
}: {
  title: string
  postId?: string
  inChat?: boolean
  createPost?: boolean
  isPostDetails?: boolean
  isMyPostDetails?: boolean
  isProfile?: boolean
}): ExtendedStackNavigationOptions {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  let options: ExtendedStackNavigationOptions = {
    title,
    headerShown: true,
    headerTitleAlign: "center",
    headerTintColor: colors.dark,
    headerStyle: styles.header,
    headerBackButtonDisplayMode: "minimal",
    headerTitleStyle: styles.headerTitle,
  }

  if (inChat) {
    return {
      ...options,
      contentStyle: {
        paddingBottom: insets.bottom,
        backgroundColor: colors.lightGray,
      },
      headerTitle: () => <ChatHeader />,
    }
  }

  if (createPost) {
    return {
      ...options,
      headerRight: () => <CreatePostHeader />,
    }
  }

  if (isPostDetails) {
    return {
      ...options,
      contentStyle: {
        paddingBottom: insets.bottom,
        backgroundColor: colors.light,
      },
      headerRight: () => <PostDetailsHeader />,
    }
  }

  if (isMyPostDetails && postId) {
    return {
      ...options,
      headerRight: () => <MyPostMenu id={postId} />,
    }
  }

  if (isProfile) {
    return {
      ...options,
      headerRight: () => (
        <Pressable style={styles.settings} onPress={() => router.push("(tabs)/profile/settings")}>
          <Feather name="settings" size={24} color={colors.dark} />
        </Pressable>
      ),
    }
  }

  return options
}

function ChatHeader() {
  const currentConversation = useAtomValue(currentConversationAtom)
  const user = useAtomValue(userSecureAtom)
  const router = useRouter()

  if (!user) return <></>

  const otherUser = currentConversation?.members.find(member => member._id !== user._id)

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "(details)/profile",
          params: { id: otherUser?._id },
        })
      }
      style={styles.otherProfileButton}
    >
      <Image
        source={
          otherUser?.picture && otherUser?.picture
            ? { uri: otherUser?.picture }
            : defaultProfilePicture
        }
        style={styles.otherProfileImage}
      />
      <Text style={styles.otherHeaderTitle}>{otherUser?.username}</Text>
    </TouchableOpacity>
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
  )
}

function PostDetailsHeader() {
  const { feedPostId } = useGlobalSearchParams<{ feedPostId: string }>()
  const savePost = useSetAtom(savePostAtom)
  const unsavePost = useSetAtom(unsavePostAtom)
  const savedPostIds = useAtomValue(savedPostIdsAtom)
  const isPostSaved = feedPostId ? savedPostIds.includes(feedPostId) : false

  return (
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
  )
}

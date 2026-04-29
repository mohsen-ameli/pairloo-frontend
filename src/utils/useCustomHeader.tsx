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
import { is } from "zod/v4/locales"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

// OtherUser is only passed when viewing another user's profile or chat
export default function useCustomHeader(
  title: string,
  backButtonVisible: boolean = false,
  inChat: boolean = false,
  createPost?: boolean,
  myPostsPage?: boolean,
  id?: string | null,
  isPostDetails?: boolean
): ExtendedStackNavigationOptions {
  const router = useRouter()
  const { id: rawPostId } = useGlobalSearchParams<{ id?: string | string[] }>()
  const postId = Array.isArray(rawPostId) ? rawPostId[0] : rawPostId
  const savePost = useSetAtom(savePostAtom)
  const unsavePost = useSetAtom(unsavePostAtom)
  const savedPostIds = useAtomValue(savedPostIdsAtom)
  const isPostSaved = postId ? savedPostIds.includes(postId) : false

  function handleProfilePress(id: string) {
    router.push({
      pathname: "(details)/profile",
      params: { id },
    })
  }
  const currentConversation = useAtomValue(currentConversationAtom)
  const user = useAtomValue(userSecureAtom)

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

  if (inChat && user && currentConversation) {
    const otherUser = currentConversation.members.find(member => member._id !== user._id)

    if (!otherUser) {
      return options
    }

    if (!otherUser) {
      return options
    }

    return {
      ...options,
      headerTitle: () => (
        <View style={styles.otherHeader}>
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
          <TouchableOpacity
            onPress={() => handleProfilePress(otherUser._id)}
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
      ),
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
      headerTitle: () => (
        <PostDetailsHeader
          backButtonVisible={backButtonVisible}
          title={title}
          isPostSaved={isPostSaved}
          onSavePress={async () => {
            if (!postId) {
              Alert.alert("Error", "Something went wrong. Post was not saved.")
              return
            }

            if (isPostSaved) {
              await unsavePost(postId)
            } else {
              await savePost(postId)
            }
          }}
        />
      ),
    }
  }

  if (title === "Profile") {
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

function PostDetailsHeader({
  backButtonVisible,
  title,
  isPostSaved,
  onSavePress,
}: {
  backButtonVisible: boolean
  title: string
  isPostSaved: boolean
  onSavePress: () => void | Promise<void>
}) {
  const router = useRouter()

  return (
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
        <Pressable style={{ padding: 6 }} onPress={onSavePress}>
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

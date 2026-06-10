import { View, Text, TouchableOpacity, Pressable, Dimensions } from "react-native"
import React, { useCallback, useState } from "react"
import { styles } from "@/src/styles/header.styles"
import { Image } from "expo-image"
import { colors, isWeb } from "@/src/utils/colors"
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
  discardDraftAtom,
  getNewQuestionAtom,
  loadingAtom as createPostLoadingAtom,
  qnaAtom,
} from "@/src/store/create-post-store"
import Feather from "@expo/vector-icons/Feather"
import { useFocusEffect, useGlobalSearchParams, useRouter } from "expo-router"
import {
  currentConversationAtom,
  activePostIdAtom,
  cleanupChatAtom,
  entireChatLoadedAtom,
  messagesAtom,
  loadingAtom as chatLoadingAtom,
} from "@/src/store/chat-store"
import { resetRegistrationAtom, userSecureAtom } from "@/src/store/auth-store"
import { currPageAtom, pageCountAtom } from "@/src/store/pager-store"
import { savePostAtom, unsavePostAtom, savedPostIdsAtom } from "@/src/store/post-detail-store"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { MyPostMenu } from "../components/MyPostMenu"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { chatSocketAtom } from "../store/socket-store"
import DropdownMenu from "../components/DropdownMenu"
import Toast from "react-native-toast-message"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function useCustomHeader({
  title,
  postId,
  inChat = false,
  isRegister = false,
  createPost = false,
  isPostDetails = false,
  isMyPostDetails = false,
  isProfile = false,
  isSettings = false,
  includeBottomPadding = false,
  isEditMode = false,
  onBackPress,
}: {
  title: string
  postId?: string
  inChat?: boolean
  isRegister?: boolean
  createPost?: boolean
  isPostDetails?: boolean
  isMyPostDetails?: boolean
  isProfile?: boolean
  isSettings?: boolean
  includeBottomPadding?: boolean
  isEditMode?: boolean
  onBackPress?: () => boolean
}): ExtendedStackNavigationOptions {
  const insets = useSafeAreaInsets()

  let options: ExtendedStackNavigationOptions = {
    title,
    headerShown: true,
    headerTitleAlign: "center",
    headerTintColor: colors.dark,
    headerStyle: {
      backgroundColor: colors.light,
    },
    headerBackButtonDisplayMode: "minimal",
    headerTitleStyle: styles.headerTitle,
    contentStyle: includeBottomPadding
      ? {
          paddingBottom: insets.bottom,
          backgroundColor: colors.light,
        }
      : {
          backgroundColor: colors.light,
        },
  }

  if (inChat) {
    return {
      ...options,
      header: () => <ChatHeader />,
    }
  }

  if (isRegister) {
    return {
      ...options,
      headerRight: () => <RegisterHeader />,
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
      headerRight: () => <ProfileHeader />,
    }
  }

  if (isSettings) {
    return {
      ...options,
      headerRight: () => <SettingsHeader />,
    }
  }

  if (isEditMode) {
    return {
      ...options,
      headerLeft: () => (
        <TouchableOpacity onPress={onBackPress} style={{ padding: 6 }}>
          <Feather name="chevron-left" size={24} color={colors.dark} />
        </TouchableOpacity>
      ),
    }
  }

  return options
}

function ChatHeader() {
  const DEFAULT_CHAT_TITLE = "General Chat"
  const currentConversation = useAtomValue(currentConversationAtom)
  const [activePostId, setActivePostId] = useAtom(activePostIdAtom)
  const user = useAtomValue(userSecureAtom)
  const socket = useAtomValue(chatSocketAtom)
  const router = useRouter()
  const [activeChat, setActiveChat] = useState<string>()
  const cleanupChat = useSetAtom(cleanupChatAtom)
  const setLoading = useSetAtom(chatLoadingAtom)
  const setEntireChatLoaded = useSetAtom(entireChatLoadedAtom)
  const setMessages = useSetAtom(messagesAtom)
  const insets = useSafeAreaInsets()

  useFocusEffect(
    useCallback(() => {
      if (!currentConversation) return

      if (activePostId) {
        const activePost = currentConversation.contactedPosts.find(
          post => post.postId === activePostId
        )
        setActiveChat(activePost ? activePost.title : DEFAULT_CHAT_TITLE)
      } else {
        setActiveChat(DEFAULT_CHAT_TITLE)
      }
    }, [currentConversation, activePostId])
  )

  function goToUserProfile() {
    cleanupChat()
    router.push({
      pathname: "(details)/general-profile",
      params: { id: otherUser?._id },
    })
  }

  function goBack() {
    cleanupChat()
    router.back()
  }

  if (!socket || !user || !currentConversation) return <></>

  const otherUser = currentConversation.members.find(member => member._id !== user._id)

  return (
    <View
      style={{
        paddingBottom: 12,
        paddingLeft: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.light,
        borderBottomColor: colors.lightGray,
        borderBottomWidth: 1,
        paddingTop: insets.top + 6,
      }}
    >
      <Pressable
        onPress={goBack}
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.light,
          borderRadius: 50,
        }}
      >
        <Feather name="arrow-left" size={26} color={colors.dark} />
      </Pressable>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          justifyContent: isWeb ? "center" : "flex-start",
        }}
      >
        {/* profile picture */}
        <TouchableOpacity onPress={goToUserProfile}>
          <Image
            source={
              otherUser?.picture && otherUser?.picture
                ? { uri: otherUser?.picture }
                : defaultProfilePicture
            }
            style={
              currentConversation.contactedPosts.length > 0
                ? styles.profileImageContacted
                : styles.profileImageNotContacted
            }
          />
        </TouchableOpacity>

        {/* username and dropdown menu */}
        <View style={{ gap: 2 }}>
          <TouchableOpacity onPress={goToUserProfile} style={styles.otherProfileUsername}>
            <Text style={styles.otherHeaderTitle}>{otherUser?.username}</Text>
          </TouchableOpacity>

          {currentConversation.contactedPosts.length > 0 && (
            <DropdownMenu
              anchor="bottom"
              dropdownWidth={isWeb ? 400 : Dimensions.get("window").width - 120}
              onPressAction={action => {
                if (action === "general") {
                  setActivePostId(null)
                } else {
                  setActivePostId(action)
                }
                setLoading(true)
                setEntireChatLoaded(false)
                setMessages([])
              }}
              actions={[
                {
                  id: "general",
                  title: DEFAULT_CHAT_TITLE,
                  titleColor: colors.dark,
                },
                ...currentConversation.contactedPosts.map(post => ({
                  id: post.postId,
                  title: post.title,
                  titleColor: colors.dark,
                })),
              ]}
            >
              <View
                style={{
                  minWidth: isWeb ? 300 : Dimensions.get("window").width - 120,
                  maxWidth: isWeb ? 300 : Dimensions.get("window").width - 120,
                  paddingVertical: 8,
                  paddingLeft: 6,
                  paddingRight: 20,
                  marginTop: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 6,
                  borderColor: colors.darkPurple,
                  borderWidth: 1.5,
                }}
              >
                <FontAwesome name="caret-down" size={20} color={colors.darkPurple} />
                <Text style={{ color: colors.dark, fontSize: 14 }} numberOfLines={1}>
                  {activeChat}
                </Text>
              </View>
            </DropdownMenu>
          )}
        </View>
      </View>

      {isWeb && <View style={{ width: 40, height: 40 }} />}
    </View>
  )
}

function RegisterHeader() {
  const discardRegistration = useSetAtom(resetRegistrationAtom)

  return (
    <Pressable onPress={discardRegistration} style={{ padding: 6 }}>
      <Feather name="trash-2" size={24} color={colors.dark} />
    </Pressable>
  )
}

function CreatePostHeader() {
  const discardDraft = useSetAtom(discardDraftAtom)
  const getNewQuestion = useSetAtom(getNewQuestionAtom)
  const loading = useAtomValue(createPostLoadingAtom)
  const currPage = useAtomValue(currPageAtom)
  const pageCount = useAtomValue(pageCountAtom)
  const qna = useAtomValue(qnaAtom)

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {0 < currPage && currPage <= pageCount - 3 && qna && qna[currPage].question.intention && (
        <Pressable onPress={getNewQuestion} disabled={loading} style={{ padding: 6 }}>
          <Feather name="rotate-ccw" size={24} color={colors.dark} />
        </Pressable>
      )}
      {qna && (
        <Pressable onPress={discardDraft} disabled={loading} style={{ padding: 6 }}>
          <Feather name="trash-2" size={24} color={colors.dark} />
        </Pressable>
      )}
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
          Toast.show({
            type: "error",
            text1: "Could not save post. Please try again later.",
          })
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

function ProfileHeader() {
  const router = useRouter()

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <TouchableOpacity onPress={() => router.push("/profile/search")} style={{ padding: 6 }}>
        <Feather name="search" size={24} color={colors.dark} />
      </TouchableOpacity>
      <Pressable style={styles.settings} onPress={() => router.push("(tabs)/profile/settings")}>
        <Feather name="settings" size={24} color={colors.dark} />
      </Pressable>
    </View>
  )
}

function SettingsHeader() {
  const router = useRouter()

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <TouchableOpacity onPress={() => router.push("/profile/feedback")} style={{ padding: 6 }}>
        <MaterialCommunityIcons name="message-alert-outline" size={24} color={colors.dark} />
      </TouchableOpacity>
    </View>
  )
}

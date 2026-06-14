import { authFetchAtom, userAtom } from "@/src/store/auth-store"
import { initChatAtom, unreadMessagesAtom } from "@/src/store/chat-store"
import { initCreatePostAtom } from "@/src/store/create-post-store"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { Image } from "expo-image"
import { Tabs } from "expo-router"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useAudioPlayer } from "expo-audio"
import { notificationSoundAtom } from "@/src/store/general-store"
import { Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useQuery } from "@tanstack/react-query"
import { UserType } from "@/src/types/user.type"

const audioSource = require("@/assets/audio/new-notification.mp3")
const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function ProtectedLayout() {
  const initChatConnection = useSetAtom(initChatAtom)
  const initCreatePost = useSetAtom(initCreatePostAtom)
  const unreadMessages = useAtomValue(unreadMessagesAtom)
  const [numUnreadMessages, setNumUnreadMessages] = useState(0)
  const player = useAudioPlayer(audioSource)
  const setNotificationSound = useSetAtom(notificationSoundAtom)
  const insets = useSafeAreaInsets()
  const authFetch = useSetAtom(authFetchAtom)
  const [user, setUser] = useAtom(userAtom)

  useQuery({ queryKey: ["my-user"], queryFn: fetchMyUser })

  async function fetchMyUser() {
    const res = await authFetch("/api/users/my-user/")
    const data: UserType = await res.json()
    setUser(data)
    return data
  }

  useEffect(() => {
    if (!user) return
    setNotificationSound(player)
    initChatConnection()
    initCreatePost()
  }, [user])

  useEffect(() => {
    if (!unreadMessages) {
      setNumUnreadMessages(0)
      return
    }
    const total = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0)
    setNumUnreadMessages(total)
  }, [unreadMessages])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.purple,
        tabBarActiveBackgroundColor: colors.light,
        tabBarInactiveTintColor: colors.dark,
        tabBarInactiveBackgroundColor: colors.light,
        headerShown: false,
        tabBarStyle:
          Platform.OS === "web"
            ? {
                backgroundColor: colors.light,
                height: 60,
              }
            : {
                backgroundColor: colors.light,
              },
      }}
      safeAreaInsets={{
        bottom: insets.bottom + Platform.select({ android: 10, default: 0 }),
      }}
    >
      <Tabs.Screen
        name="(post)"
        options={{
          title: "Home",
          headerShown: false,
          tabBarLabelStyle: {
            marginTop: 2,
          },
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          title: "Create Post",
          headerShown: false,
          tabBarLabelStyle: {
            marginTop: 2,
          },
          tabBarIcon: ({ color, size }) => <Feather name="plus-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarBadge: numUnreadMessages > 0 ? numUnreadMessages : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.purple,
            color: colors.light,
          },
          tabBarLabelStyle: {
            marginTop: 2,
          },
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarLabelStyle: {
            marginTop: 2,
          },
          tabBarIcon: ({ color, size }) => <ProfileTab size={size} />,
        }}
      />
    </Tabs>
  )
}

function ProfileTab({ size }: { size: number }) {
  const user = useAtomValue(userAtom)

  return (
    <Image
      source={user?.picture ? { uri: user?.picture } : defaultProfilePicture}
      style={{
        width: size + 3,
        height: size + 3,
        borderRadius: 25,
      }}
      contentFit="contain"
    />
  )
}

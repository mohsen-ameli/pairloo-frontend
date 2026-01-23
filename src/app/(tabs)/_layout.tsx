import { userAtom } from "@/src/store/auth-store"
import { initChatAtom, unreadMessagesAtom } from "@/src/store/chat-store"
import { initCreatePostAtom } from "@/src/store/create-post-store"
import { pathStore } from "@/src/store/general-store"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { Image } from "expo-image"
import { Tabs, useFocusEffect, usePathname } from "expo-router"
import { useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { useAudioPlayer } from "expo-audio"
import { notificationSoundAtom } from "@/src/store/general-store"
import { View } from "react-native"

const audioSource = require("@/assets/audio/new-notification.mp3")
const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function ProtectedLayout() {
  const initChatConnection = useSetAtom(initChatAtom)
  const initCreatePost = useSetAtom(initCreatePostAtom)
  const user = useAtomValue(userAtom)
  const pathname = usePathname()
  const setPath = useSetAtom(pathStore)
  const unreadMessages = useAtomValue(unreadMessagesAtom)
  const [numUnreadMessages, setNumUnreadMessages] = useState(0)
  const player = useAudioPlayer(audioSource)
  const setNotificationSound = useSetAtom(notificationSoundAtom)

  useEffect(() => {
    setNotificationSound(player)
  }, [])

  useEffect(() => {
    if (!unreadMessages) {
      setNumUnreadMessages(0)
      return
    }
    const total = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0)
    setNumUnreadMessages(total)
  }, [unreadMessages])

  useEffect(() => {
    setPath(pathname)
  }, [pathname])

  useFocusEffect(
    useCallback(() => {
      // This will run when the screen is focused
      async function initialize() {
        console.log("initializing")
        await initChatConnection()
        await initCreatePost()
      }
      initialize()
    }, [])
  )

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.purple,
        tabBarBackground() {
          return <View style={{ backgroundColor: colors.light, flex: 1 }} />
        },
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
        name="my-posts"
        options={{
          title: "My Posts",
          headerShown: false,
          tabBarLabelStyle: {
            marginTop: 2,
          },
          tabBarIcon: ({ color, size }) => <Feather name="file-text" size={size} color={color} />,
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
        name="settings"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarLabelStyle: {
            marginTop: 2,
          },
          tabBarIcon: ({ color, size }) => (
            <Image
              source={user?.picture ? { uri: user?.picture } : defaultProfilePicture}
              style={{
                width: size + 3,
                height: size + 3,
                borderRadius: 25,
              }}
              contentFit="contain"
            />
          ),
        }}
      />
    </Tabs>
  )
}

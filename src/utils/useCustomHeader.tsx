import { View, Text, TouchableOpacity, Pressable } from "react-native"
import React from "react"
import { styles } from "@/src/styles/header.styles"
import { Image } from "expo-image"
import { OtherUser } from "@/src/types/chat.type"
import { colors } from "@/src/utils/colors"
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient"
import { useAtomValue, useSetAtom } from "jotai"
import { discardDraftAtom, getNewQuestionAtom, loadingAtom } from "../store/create-post-store"
import Feather from "@expo/vector-icons/Feather"
import { useRouter } from "expo-router"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

// OtherUser is only passed when viewing another user's profile or chat
export default function useCustomHeader(
  title: string,
  backButtonVisible: boolean = false,
  otherUser?: OtherUser,
  createPost?: boolean
): ExtendedStackNavigationOptions {
  const router = useRouter()

  function handleProfilePress() {}
  const discardDraft = useSetAtom(discardDraftAtom)
  const getNewQuestion = useSetAtom(getNewQuestionAtom)
  const loading = useAtomValue(loadingAtom)

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

  if (otherUser) {
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
          <TouchableOpacity onPress={handleProfilePress} style={styles.otherProfileButton}>
            <Image
              source={otherUser.picture ? { uri: otherUser.picture } : defaultProfilePicture}
              style={styles.otherProfileImage}
            />
          </TouchableOpacity>
          <Text style={styles.otherHeaderTitle}>{otherUser.username}</Text>
        </View>
      ),
    }
  }

  if (createPost) {
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
            <Text style={styles.headerTitle}>Create Post</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pressable onPress={getNewQuestion} disabled={loading} style={{ padding: 6 }}>
                <Feather name="rotate-ccw" size={24} color={colors.dark} />
              </Pressable>
              <Pressable onPress={discardDraft} disabled={loading} style={{ padding: 6 }}>
                <Feather name="trash-2" size={24} color={colors.dark} />
              </Pressable>
            </View>
          </View>
        </View>
      ),
    }
  }

  return options
}

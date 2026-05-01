import React, { useState, useLayoutEffect, useEffect } from "react"
import { View, Text, Pressable, FlatList, ActivityIndicator, Animated } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { authFetchAtom } from "@/src/store/auth-store"
import { ProfileSocialUserType } from "@/src/types/user.type"
import { profileStyles } from "@/src/styles/profile.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { Image } from "expo-image"
import useCustomHeader from "@/src/utils/useCustomHeader"

type Params = {
  type?: "followers" | "following"
  id?: string
}

export default function SocialListPage() {
  const { type, id } = useLocalSearchParams<Params>()
  const router = useRouter()
  const navigation = useNavigation()
  const authFetch = useSetAtom(authFetchAtom)
  const [active, setActive] = useState<"followers" | "following">(
    type === "following" ? "following" : "followers"
  )
  const [containerWidth, setContainerWidth] = useState(0)
  const [slideAnim] = useState(new Animated.Value(0))

  const headerOptions = useCustomHeader("Social List", true)

  useLayoutEffect(() => {
    navigation.setOptions(headerOptions)
  }, [navigation, headerOptions])

  useEffect(() => {
    if (containerWidth > 0) {
      const targetPosition = active === "followers" ? 0 : containerWidth / 2
      Animated.timing(slideAnim, {
        toValue: targetPosition,
        duration: 300,
        useNativeDriver: false,
      }).start()
    }
  }, [active, containerWidth, slideAnim])

  async function fetchSocial() {
    if (id) {
      const res = await authFetch(`/api/users/profile/${id}`)
      const data = await res.json()
      return { followers: data.followers || [], following: data.following || [] }
    }

    const res = await authFetch(`/api/users/my-social`)
    const data = await res.json()
    return { followers: data.followers || [], following: data.following || [] }
  }

  const { data, isPending, isError } = useQuery({
    queryKey: ["social-list", id || "me"],
    queryFn: fetchSocial,
  })

  if (isPending) {
    return (
      <View style={profileStyles.generalContainer}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View style={profileStyles.generalContainer}>
        <Text style={{ color: colors.dark }}>Error loading list.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.purple }}>Go back</Text>
        </Pressable>
      </View>
    )
  }

  const list: ProfileSocialUserType[] = active === "followers" ? data.followers : data.following

  return (
    <View style={profileStyles.socialModalContainer}>
      <View
        style={profileStyles.actionContainer}
        onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            profileStyles.actionTabAnimation,
            { width: "50%", transform: [{ translateX: slideAnim }] },
          ]}
        />
        <Pressable style={profileStyles.profileTab} onPress={() => setActive("followers")}>
          <Text
            style={active === "followers" ? profileStyles.activeTab : profileStyles.nonActiveTab}
          >
            Followers
          </Text>
        </Pressable>

        <Pressable style={profileStyles.profileTab} onPress={() => setActive("following")}>
          <Text
            style={active === "following" ? profileStyles.activeTab : profileStyles.nonActiveTab}
          >
            Following
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={item => item._id}
        contentContainerStyle={profileStyles.socialListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={profileStyles.emptyStateContainer}>
            <Text style={profileStyles.emptyStateText}>
              {active === "followers" ? "No followers yet." : "Not following anyone yet."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "(details)/profile",
                params: { id: item._id },
              })
            }
            style={profileStyles.socialRow}
          >
            <Image
              source={
                item.picture ? { uri: item.picture } : require("@/assets/images/default_pfp.png")
              }
              style={profileStyles.socialAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={profileStyles.socialName} numberOfLines={1}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={profileStyles.socialUsername} numberOfLines={1}>
                @{item.username}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  )
}

import React, { useState, useLayoutEffect } from "react"
import { View, Text, Pressable, FlatList, SafeAreaView, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { authFetchAtom } from "@/src/store/auth-store"
import { ProfileSocialUserType } from "@/src/types/user.type"
import { profileStyles } from "@/src/styles/profile.styles"
import { colors } from "@/src/utils/colors"
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

  const headerOptions = useCustomHeader("Social List", true)

  useLayoutEffect(() => {
    navigation.setOptions(headerOptions)
  }, [navigation, headerOptions])

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
    <SafeAreaView style={profileStyles.socialModalContainer}>
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, marginVertical: 15 }}>
        <Pressable
          onPress={() => setActive("followers")}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            borderRadius: 8,
            backgroundColor: active === "followers" ? colors.purple : colors.light,
          }}
        >
          <Text style={{ color: active === "followers" ? "white" : colors.dark }}>Followers</Text>
        </Pressable>

        <Pressable
          onPress={() => setActive("following")}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            borderRadius: 8,
            backgroundColor: active === "following" ? colors.purple : colors.light,
          }}
        >
          <Text style={{ color: active === "following" ? "white" : colors.dark }}>Following</Text>
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
    </SafeAreaView>
  )
}

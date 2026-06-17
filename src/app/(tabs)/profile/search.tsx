import { authFetchAtom } from "@/src/store/auth-store"
import { profileStyles } from "@/src/styles/profile.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { useMemo, useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { debounce } from "lodash"
import { commonStyles } from "@/src/styles/common.styles"
import { SafeAreaView } from "react-native-safe-area-context"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function SearchPage() {
  const [results, setResults] = useState<
    {
      _id: string
      username: string
      firstName: string
      lastName: string
      picture: string
      score: number
    }[]
  >([])
  const authFetch = useSetAtom(authFetchAtom)
  const [query, setQuery] = useState("")
  const [isInit, setIsInit] = useState(false)
  const router = useRouter()

  async function handleDebounceFn(query: string) {
    try {
      const res = await authFetch("/api/users/search?q=" + query)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const debounceFn = useMemo(() => debounce(handleDebounceFn, 500), [])

  function handleSearch(query: string) {
    const queryClean = query.trim()
    setQuery(queryClean)
    setIsInit(true)

    if (queryClean.length <= 1) {
      setResults([])
      debounceFn.cancel()
      return
    }

    debounceFn(query)
  }
  return (
    <SafeAreaView style={commonStyles.modalContainer}>
      <View style={commonStyles.searchContainer}>
        <Pressable style={commonStyles.dismissButton} onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.darkGray} />
        </Pressable>
        <TextInput
          placeholder="Search for people..."
          style={commonStyles.searchInput}
          onChangeText={handleSearch}
          autoFocus
          value={query}
        />
      </View>

      <View style={profileStyles.socialModalContainer}>
        <FlashList
          data={results}
          keyExtractor={item => item._id}
          contentContainerStyle={profileStyles.socialListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={profileStyles.emptyStateContainer}>
              <Text style={profileStyles.emptyStateText}>{isInit && "No results found."}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                router.back()
                router.push({
                  pathname: "(details)/general-profile",
                  params: { id: item._id },
                })
              }}
              style={profileStyles.socialRow}
            >
              <Image
                source={item.picture ? { uri: item.picture } : defaultProfilePicture}
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
    </SafeAreaView>
  )
}

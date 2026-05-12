import { authFetchAtom } from "@/src/store/auth-store"
import { profileStyles } from "@/src/styles/profile.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import { Stack, useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { debounce } from "lodash"

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
  const inputRef = useRef<TextInput>(null!)
  const authFetch = useSetAtom(authFetchAtom)
  const [query, setQuery] = useState("")
  const [isInit, setIsInit] = useState(false)
  const router = useRouter()

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current.focus()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

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

  function handleClear() {
    inputRef.current.clear()
    setResults([])
    setQuery("")
    debounceFn.cancel()
    setIsInit(false)
    inputRef.current.focus()
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                placeholder="Search for people..."
                style={{
                  color: colors.dark,
                  flexGrow: 1,
                  borderWidth: 1,
                  borderColor: colors.borderGray,
                  paddingHorizontal: 8,
                  borderRadius: 5,
                  fontSize: 16,
                }}
                onChangeText={handleSearch}
                value={query}
                ref={inputRef}
              />
              {query.length > 0 && (
                <Pressable
                  style={{
                    position: "absolute",
                    right: 10,
                    backgroundColor: colors.lightGray,
                    padding: 5,
                    borderRadius: 5,
                  }}
                  onPress={handleClear}
                >
                  <Feather name="x" size={24} color={colors.darkGray} />
                </Pressable>
              )}
            </View>
          ),
        }}
      />

      <View style={profileStyles.socialModalContainer}>
        <FlashList
          data={results}
          keyExtractor={item => item._id}
          contentContainerStyle={profileStyles.socialListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={profileStyles.emptyStateContainer}>
              <Text style={profileStyles.emptyStateText}>{isInit && "No results found."}</Text>
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
    </>
  )
}

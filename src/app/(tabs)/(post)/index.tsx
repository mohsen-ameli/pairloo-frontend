import { useSetAtom } from "jotai"
import { useRouter } from "expo-router"
import { Text, View, RefreshControl, Pressable, Platform, ActivityIndicator } from "react-native"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { styles } from "@/src/styles/feed.styles"
import { GeneralPostType } from "@/src/types/post.type"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { errorStyles } from "@/src/styles/error.styles"
import { authFetchAtom } from "@/src/store/auth-store"
import { useEffect, useState } from "react"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

import {
  NativeAdView,
  TestIds,
  NativeAd,
  NativeAsset,
  NativeAssetType,
} from "react-native-google-mobile-ads"
import { Image } from "expo-image"
import { ANDROID_ADS_UNIT_ID, IOS_ADS_UNIT_ID } from "@/src/utils/constants"
import { colors } from "@/src/utils/colors"
import { FlashList } from "@shopify/flash-list"
import { sinceNow } from "@/src/utils/format-date"
import { RatingStarSingle } from "@/src/components/RatingStar"

export default function Index() {
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const { data: posts, isError, isPending } = useQuery({ queryKey: ["feed"], queryFn: fetchPosts })

  async function fetchPosts() {
    const res = await authFetch("/api/posts/my-feed")
    const data: GeneralPostType[] = await res.json()

    return data
  }

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: ["feed"] })
  }

  async function handlePostPress(postId: string) {
    router.push({
      pathname: "/feed-post",
      params: { id: postId },
    })

    await authFetch("/api/posts/interaction", {
      method: "POST",
      body: JSON.stringify({ postId, type: "post_view" }),
    })
  }
  
  async function loadMore() {
    console.log("load more posts")
  }

  if (isPending) {
    return (
      <View style={styles.container}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={errorStyles.errorText}>Error loading posts. Please try again.</Text>
        <Pressable style={errorStyles.retryButton} onPress={refresh}>
          <Text style={errorStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <FlashList
      data={posts}
      style={styles.listStyles}
      contentContainerStyle={styles.listContainerStyles}
      refreshControl={<RefreshControl refreshing={isPending} onRefresh={refresh} />}
      onEndReached={loadMore}
      keyExtractor={item => item._id}
      renderItem={({ item: post, index }) => (
        <View key={post._id}>
          {index % 7 === 6 && <AdView />}
          <Pressable
            style={styles.postCard}
            onPress={() => {
              router.push({
                pathname: "/feed-post",
                params: { feedPostId: post._id },
              })
            }}
          >
            <View style={styles.postHeader}>
              <Image
                source={post.picture ? { uri: post.picture } : defaultProfilePicture}
                style={styles.postHeaderImage}
              />
              <View style={styles.postHeaderTextContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.postHeaderName} numberOfLines={1}>
                    {post.firstName} {post.lastName}
                  </Text>
                  <Text style={styles.postUsername}>
                    {"• "}
                    {sinceNow(post.createdAt.toString())} ago
                  </Text>
                </View>
                <Text style={styles.postUsername} numberOfLines={1}>
                  @{post.username}
                </Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.title}</Text>
            {post.images && post.images.length > 0 ? (
              <View style={styles.postImageContainer}>
                <Image
                  source={{ uri: post.images[0] }}
                  style={styles.postImage}
                  contentFit="cover"
                />
              </View>
            ) : (
              <Text style={styles.descriptionStyle} numberOfLines={3}>
                {post.description}
              </Text>
            )}
          </Pressable>
        </View>
      )}
      ListFooterComponent={
        <ActivityIndicator size="large" color={colors.blue} style={{ marginVertical: 20 }} />
      }
    />
  )
}

function AdView() {
  const [nativeAd, setNativeAd] = useState<NativeAd>()

  useEffect(() => {
    const adUnitId = __DEV__
      ? TestIds.NATIVE
      : Platform.OS === "android"
        ? ANDROID_ADS_UNIT_ID
        : IOS_ADS_UNIT_ID
    NativeAd.createForAdRequest(adUnitId).then(setNativeAd).catch(console.error)
  }, [])

  if (!nativeAd) {
    return null
  }

  return (
    <View style={styles.postCard}>
      <NativeAdView nativeAd={nativeAd}>
        <View style={styles.postHeader}>
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image
              source={nativeAd.icon?.url ? { uri: nativeAd.icon.url } : defaultProfilePicture}
              style={styles.postHeaderImage}
              contentFit="cover"
            />
          </NativeAsset>
          <View style={styles.postHeaderTextContainer}>
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text style={styles.postHeaderName} numberOfLines={1}>
                {nativeAd.advertiser ?? "Sponsored"}
              </Text>
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.STORE}>
              <Text style={styles.postUsername} numberOfLines={1}>
                @{nativeAd.store ?? "sponsored"}
              </Text>
            </NativeAsset>
          </View>
        </View>
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Text style={styles.postContent} numberOfLines={2}>
            {nativeAd.headline}
          </Text>
        </NativeAsset>

        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text style={styles.descriptionStyle}>{nativeAd.body}</Text>
        </NativeAsset>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
          {nativeAd.price && (
            <NativeAsset assetType={NativeAssetType.PRICE}>
              <Text style={styles.descriptionStyle} numberOfLines={1}>
                Price: {!isNaN(parseFloat(nativeAd.price)) ? `$${nativeAd.price}` : "Free"}
              </Text>
            </NativeAsset>
          )}

          {nativeAd.starRating && (
            <NativeAsset assetType={NativeAssetType.STAR_RATING}>
              <Text style={styles.descriptionStyle} numberOfLines={1}>
                Rating: {nativeAd.starRating}{" "}
                <RatingStarSingle value={nativeAd.starRating} size={16} />
              </Text>
            </NativeAsset>
          )}
        </View>

        {/* Image */}
        {nativeAd.images?.[0]?.url && (
          <NativeAsset assetType={NativeAssetType.IMAGE}>
            <Image
              source={{ uri: nativeAd.images[0].url }}
              style={{ width: "100%", height: 150, borderRadius: 8 }}
              contentFit="cover"
            />
          </NativeAsset>
        )}
      </NativeAdView>
    </View>
  )
}

import { useEffect, useState } from "react"
import { Platform, Text, View } from "react-native"
import { Image } from "expo-image"
import {
  NativeAdView,
  TestIds,
  NativeAd,
  NativeAsset,
  NativeAssetType,
} from "react-native-google-mobile-ads"

import { styles } from "@/src/styles/feed.styles"
import { ANDROID_ADS_UNIT_ID, IOS_ADS_UNIT_ID } from "@/src/utils/constants"
import { RatingStarSingle } from "@/src/components/RatingStar"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function FeedAdView() {
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

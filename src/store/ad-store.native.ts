import {
  getTrackingPermissionsAsync,
  PermissionStatus,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency"
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads"

export async function setupAds() {
  try {
    const { status } = await getTrackingPermissionsAsync()
    if (status === PermissionStatus.UNDETERMINED) {
      await requestTrackingPermissionsAsync()
    }

    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
      testDeviceIdentifiers: ["EMULATOR"],
    })

    await mobileAds().initialize()
  } catch (error) {
    console.error("Error setting up ads:", error)
  }
}

import { ExpoConfig } from "expo/config"

const owner = "noobmoe"
const name = "pairloo"
const identifier = `com.${name}`

module.exports = ({ config }: { config: ExpoConfig }) => {
  return {
    owner: owner,
    name: name,
    slug: name,
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: name,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: identifier,
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/adaptive-icon.png",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_API_KEY,
        },
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: identifier,
      googleServicesFile: "./google-services.json",
      permissions: ["android.permission.RECORD_AUDIO", "android.permission.MODIFY_AUDIO_SETTINGS"],
    },
    web: {
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-audio",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#1d1d25",
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "expo-maps",
        {
          requestLocationPermission: true,
          locationPermission: "Allow $(PRODUCT_NAME) to use your location",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "43d5563e-4217-488d-861e-930eff4e3ca8",
      },
    },
  }
}

import { useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Keyboard,
  Pressable,
} from "react-native"
import { BASE_URL } from "@/src/utils/constants"
import { City } from "@/src/types/city.types"
import { locSelectStyles } from "@/src/styles/location-selector.styles"
import { baseColors, colors } from "@/src/utils/colors"
import { useRouter } from "expo-router"
import { settingsAtom } from "@/src/store/create-post-store"
import { useAtom, useAtomValue } from "jotai"
import { userAtom } from "@/src/store/auth-store"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { zoomToRadiusMeters } from "@/src/utils/map-utils"
import { useExpoMaps } from "@/src/utils/useExpoMaps"
import MapUnavailable from "@/src/components/MapUnavailable"
import { AppleMaps, GoogleMaps } from "expo-maps"
import { FlashList } from "@shopify/flash-list"
import Feather from "@expo/vector-icons/Feather"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import CustomButton from "@/src/components/CustomButton"
import { debounce } from "lodash"
import WebGoogleMap from "@/src/components/WebGoogleMap"

type CameraEvent = {
  coordinates: {
    latitude?: number | undefined
    longitude?: number | undefined
  }
  zoom: number
  tilt: number
  bearing: number
}

export type MapRegion = {
  latitude: number
  longitude: number
  zoom: number
  distance: number
}

const DEFAULT_ZOOM = 12

export default function MapSelector() {
  const router = useRouter()
  const user = useAtomValue(userAtom)!
  const { maps, isExpoGo, isLoading } = useExpoMaps()
  const region = useRef<MapRegion>({
    latitude: user.latitude,
    longitude: user.longitude,
    zoom: DEFAULT_ZOOM,
    distance: zoomToRadiusMeters(DEFAULT_ZOOM, 0),
  })
  const [citySearchInput, setCitySearchInput] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const androidMapRef = useRef<GoogleMaps.MapView>(null)
  const appleMapRef = useRef<AppleMaps.MapView>(null)
  const [settings, setSettings] = useAtom(settingsAtom)
  const GoogleMapView = maps?.GoogleMaps.View
  const AppleMapView = maps?.AppleMaps.View
  const insets = useSafeAreaInsets()

  async function handleDebounceFn(text: string) {
    try {
      const url = `${BASE_URL}/api/locations/search?q=${encodeURIComponent(text)}`
      const res = await fetch(url)
      const data: City[] = await res.json()
      setCities(data)
    } catch (error) {
      setCities([])
    }
  }

  const debounceFn = useMemo(() => debounce(handleDebounceFn, 500), [])

  async function handleCitySearch(text: string) {
    setCitySearchInput(text)
    if (text.length === 0) {
      setCities([])
      debounceFn.cancel()
      return
    }

    debounceFn(text)
  }

  function handleClear() {
    setCitySearchInput("")
    setCities([])
    debounceFn.cancel()
  }

  function handleCameraMove(event: CameraEvent) {
    region.current.latitude = event.coordinates.latitude!
    region.current.longitude = event.coordinates.longitude!
    region.current.zoom = event.zoom
  }

  async function saveCurrentLocation() {
    region.current.distance = zoomToRadiusMeters(region.current.zoom, region.current.latitude)

    const url = `${BASE_URL}/api/locations/closest-location?latitude=${region.current.latitude}&longitude=${region.current.longitude}`
    const res = await fetch(url)
    const data: City = await res.json()

    let closeCity = "Location set."
    if (data) {
      if (data.state_name) {
        closeCity = `Near ${data.name}, ${data.state_name}, ${data.country_name}`
      } else {
        closeCity = `Near ${data.name}, ${data.country_name}`
      }
    }

    setSettings(async curr => ({
      ...(await curr),
      location: {
        latitude: region.current.latitude,
        longitude: region.current.longitude,
      },
      distance: region.current.distance,
      zoom: region.current.zoom,
      closeCity,
    }))

    router.back()
  }

  useEffect(() => {
    if (!settings.location) return
    region.current = {
      latitude: settings.location.latitude,
      longitude: settings.location.longitude,
      zoom: settings.zoom,
      distance: settings.distance,
    }
    try {
      if (Platform.OS === "android") {
        androidMapRef.current?.setCameraPosition({
          coordinates: {
            latitude: region.current.latitude,
            longitude: region.current.longitude,
          },
          zoom: region.current.zoom,
        })
      } else {
        appleMapRef.current?.setCameraPosition({
          coordinates: {
            latitude: region.current.latitude,
            longitude: region.current.longitude,
          },
          zoom: region.current.zoom,
        })
      }
    } catch (error) {
      console.error("Error setting camera position: ", error)
    }
  }, [settings.location])

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 10,
          right: 10,
          zIndex: 1,
          borderRadius: 8,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => {
            router.back()
          }}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.light,
            borderRadius: 50,
          }}
        >
          <Feather name="arrow-left" size={26} color={colors.dark} />
        </Pressable>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.light,
            borderRadius: 5,
          }}
        >
          <TextInput
            value={citySearchInput}
            onChangeText={handleCitySearch}
            placeholder="Search for a city"
            style={{
              color: colors.dark,
              height: 40,
              paddingLeft: 10,
              paddingRight: 50,
              borderWidth: 1,
              borderColor: colors.borderGray,
              borderRadius: 5,
            }}
          />
          {citySearchInput.length > 0 && (
            <Pressable
              style={{
                position: "absolute",
                right: 5,
                top: 2.5,
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
      </View>
      {cities.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 55,
            left: 10,
            right: 10,
            zIndex: 1,
            backgroundColor: colors.light,
            borderRadius: 5,
          }}
        >
          <FlashList
            data={cities}
            keyboardShouldPersistTaps="handled"
            keyExtractor={item => item._id.toString()}
            style={{ maxHeight: 200, display: citySearchInput.length > 0 ? "flex" : "none" }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  region.current.latitude = item.location.coordinates[1]
                  region.current.longitude = item.location.coordinates[0]
                  region.current.zoom = DEFAULT_ZOOM
                  region.current.distance = zoomToRadiusMeters(
                    DEFAULT_ZOOM,
                    item.location.coordinates[1]
                  )
                  const newPosition = {
                    coordinates: {
                      latitude: region.current.latitude,
                      longitude: region.current.longitude,
                    },
                    zoom: settings.zoom,
                  }

                  try {
                    if (Platform.OS === "android") {
                      androidMapRef.current?.setCameraPosition(newPosition)
                    } else {
                      appleMapRef.current?.setCameraPosition(newPosition)
                    }
                  } catch (error) {
                    console.error("Error setting camera position: ", error)
                  }
                  setSettings(async curr => ({
                    ...(await curr),
                    location: {
                      latitude: region.current.latitude,
                      longitude: region.current.longitude,
                    },
                    distance: region.current.distance,
                    zoom: region.current.zoom,
                  }))
                  Keyboard.dismiss()
                  setCitySearchInput("")
                  setCities([])
                }}
                style={locSelectStyles.cityItem}
              >
                <Text style={{ color: colors.dark }}>
                  {item.name} ({item.state_name}, {item.country_name})
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + (Platform.OS === "ios" ? 30 : 10),
          left: 10,
          right: 10,
          zIndex: 1,
          borderRadius: 8,
          flexDirection: "row",
          gap: 10,
          width: "82%",
        }}
      >
        <CustomButton color={colors.blue} onPress={saveCurrentLocation}>
          <Text style={{ color: baseColors.light }}>Confirm</Text>
        </CustomButton>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.gray }}>Loading map...</Text>
        </View>
      ) : isExpoGo ? (
        <View style={{ flex: 1, paddingTop: 80 }}>
          <MapUnavailable
            title="Maps are unavailable in Expo Go"
            description="Search for a city above to set your approximate location. The map picker requires a development build."
          />
        </View>
      ) : Platform.OS === "android" && GoogleMapView ? (
        <GoogleMapView
          style={{ flex: 1 }}
          cameraPosition={{
            coordinates: {
              latitude: region.current.latitude,
              longitude: region.current.longitude,
            },
            zoom: region.current.zoom,
          }}
          onCameraMove={handleCameraMove}
          ref={androidMapRef}
          onMapClick={() => Keyboard.dismiss()}
        />
      ) : Platform.OS === "ios" && AppleMapView ? (
        <>
          <AppleMapView
            style={{ flex: 1 }}
            cameraPosition={{
              coordinates: {
                latitude: region.current.latitude,
                longitude: region.current.longitude,
              },
              zoom: region.current.zoom,
            }}
            onCameraMove={handleCameraMove}
            ref={appleMapRef}
            onMapClick={() => Keyboard.dismiss()}
            uiSettings={{
              myLocationButtonEnabled: false,
              togglePitchEnabled: false,
              compassEnabled: false,
              scaleBarEnabled: false,
            }}
          />

          {/* zoom in/out since apple maps doesn't have this */}
          <View
            style={{
              position: "absolute",
              bottom: insets.bottom + 15,
              right: 12,
              backgroundColor: colors.lightTransparent,
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                const newZoom = region.current.zoom + 1
                region.current.zoom = newZoom
                region.current.distance = zoomToRadiusMeters(newZoom, region.current.latitude)
                setSettings(async curr => ({
                  ...(await curr),
                  distance: region.current.distance,
                  zoom: region.current.zoom,
                }))
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderGray,
              }}
            >
              <FontAwesome name="plus" size={18} color={colors.darkGray} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const newZoom = region.current.zoom - 1
                region.current.zoom = newZoom
                region.current.distance = zoomToRadiusMeters(newZoom, region.current.latitude)
                setSettings(async curr => ({
                  ...(await curr),
                  distance: region.current.distance,
                  zoom: region.current.zoom,
                }))
              }}
              style={{ paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <FontAwesome name="minus" size={18} color={colors.darkGray} />
            </TouchableOpacity>
          </View>
        </>
      ) : Platform.OS === "web" ? (
        <WebGoogleMap
          cameraPosition={{
            coordinates: {
              lat: region.current.latitude,
              lng: region.current.longitude,
            },
            zoom: region.current.zoom,
          }}
          region={region}
        />
      ) : (
        !maps && (
          <MapUnavailable
            title="Map could not be loaded"
            description="Try restarting the app or use a development build if the native map module is unavailable."
          />
        )
      )}

      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <View
          style={{
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: "rgba(128, 0, 128, 0.2)",
            borderColor: colors.purple,
            borderWidth: 2,
          }}
        ></View>
      </View>
    </View>
  )
}

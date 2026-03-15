import { useCallback, useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Keyboard,
} from "react-native"
import { AppleMaps, GoogleMaps } from "expo-maps"
import { BASE_URL } from "@/src/utils/constants"
import { City } from "@/src/types/city.types"
import { locSelectStyles } from "@/src/styles/location-selector.styles"
import { colors } from "@/src/utils/colors"
import { useFocusEffect } from "expo-router"
import { settingsAtom } from "@/src/store/create-post-store"
import { useAtom, useAtomValue } from "jotai"
import { userAtom } from "@/src/store/auth-store"
import { currPageAtom } from "@/src/store/pager-store"

type CameraEvent = {
  coordinates: {
    latitude?: number | undefined
    longitude?: number | undefined
  }
  zoom: number
  tilt: number
  bearing: number
}

const DEFAULT_ZOOM = 12

export default function MapSelector() {
  const user = useAtomValue(userAtom)!
  const region = useRef({
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
  const currPage = useAtomValue(currPageAtom)
  const timeoutRef = useRef(0)

  async function handleCitySearch(text: string) {
    setCitySearchInput(text)
    if (text.length === 0) {
      setCities([])
      return
    }
    try {
      const url = `${BASE_URL}/api/locations/search?q=${encodeURIComponent(text)}`
      const res = await fetch(url)
      const data = await res.json()
      setCities(data)
    } catch (error) {
      setCities([])
    }
  }

  function zoomToRadiusMeters(zoom: number, latitude: number, circleRadiusPx = 150): number {
    const metersPerPixel = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom)
    return Math.round(metersPerPixel * circleRadiusPx)
  }

  function handleCameraMove(event: CameraEvent) {
    const radiusMeters = zoomToRadiusMeters(event.zoom, event.coordinates.latitude!)
    region.current.distance = radiusMeters
    region.current.zoom = event.zoom
    region.current.latitude = event.coordinates.latitude!
    region.current.longitude = event.coordinates.longitude!

    // TODO: temporary fix to save settings. Once a onMoveEnd or something similar is implemented in expo-maps, this can be removed
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setSettings({
        ...settings,
        location: {
          latitude: region.current.latitude,
          longitude: region.current.longitude,
        },
        distance: region.current.distance,
        zoom: region.current.zoom,
      })
    }, 2000)
  }

  useFocusEffect(
    useCallback(() => {
      return async () => {
        await setSettings({
          ...settings,
          location: {
            latitude: region.current.latitude,
            longitude: region.current.longitude,
          },
          distance: region.current.distance,
          zoom: region.current.zoom,
        })
      }
    }, [currPage])
  )

  useEffect(() => {
    async function saveCurrentLocation() {
      if (settings.location) {
        region.current.latitude = settings.location.latitude
        region.current.longitude = settings.location.longitude
        region.current.distance = zoomToRadiusMeters(settings.zoom, settings.location.latitude)
        region.current.zoom = settings.zoom
        const newPosition = {
          coordinates: { latitude: region.current.latitude, longitude: region.current.longitude },
          zoom: settings.zoom,
        }

        try {
          if (Platform.OS === "android") {
            androidMapRef.current?.setCameraPosition(newPosition)
          } else {
            appleMapRef.current?.setCameraPosition(newPosition)
          }
        } catch (error) {
          console.log("Error setting camera position: ", error)
        }
        return
      }

      // let { status } = await Location.requestForegroundPermissionsAsync()
      // if (status !== "granted") {
      //   console.log("Permission to access location was denied")
      //   return
      // }

      // try {
      //   const lastKnownLocation = await Location.getLastKnownPositionAsync()
      //   if (lastKnownLocation) {
      //     console.log("last known location: ", lastKnownLocation)
      //     setPosition(lastKnownLocation.coords.latitude, lastKnownLocation.coords.longitude)
      //   }
      //   const currLocation = await Location.getCurrentPositionAsync({})
      //   if (currLocation) {
      //     console.log("current location: ", currLocation)
      //     setPosition(currLocation.coords.latitude, currLocation.coords.longitude)
      //   }
      // } catch (error) {
      //   console.log("Error getting location: ", error)
      // }
    }

    saveCurrentLocation()
  }, [settings.location])

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          zIndex: 1,
          borderRadius: 8,
          flexDirection: "row",
          gap: 10,
        }}
      >
        {/* <Pressable
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
        </Pressable> */}
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
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: colors.borderGray,
              borderRadius: 5,
            }}
          />
          <FlatList
            data={cities}
            keyExtractor={item => item._id.toString()}
            style={{ maxHeight: 200, display: citySearchInput.length > 0 ? "flex" : "none" }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  region.current.latitude = item.latitude
                  region.current.longitude = item.longitude
                  region.current.zoom = DEFAULT_ZOOM
                  region.current.distance = zoomToRadiusMeters(DEFAULT_ZOOM, item.latitude)
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
                    console.log("Error setting camera position: ", error)
                  }
                  setSettings({
                    ...settings,
                    location: {
                      latitude: item.latitude,
                      longitude: item.longitude,
                    },
                    distance: region.current.distance,
                    zoom: region.current.zoom,
                  })
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
      </View>

      {Platform.OS === "android" ? (
        <GoogleMaps.View
          style={{ flex: 1 }}
          cameraPosition={{
            coordinates: {
              latitude: region.current.latitude,
              longitude: region.current.longitude,
            },
            zoom: region.current.zoom,
          }}
          ref={androidMapRef}
          onCameraMove={handleCameraMove}
          onMapClick={() => {
            Keyboard.dismiss()
            setCitySearchInput("")
            setCities([])
          }}
        />
      ) : (
        <AppleMaps.View
          style={{ flex: 1 }}
          cameraPosition={{
            coordinates: {
              latitude: region.current.latitude,
              longitude: region.current.longitude,
            },
            zoom: region.current.zoom,
          }}
          ref={appleMapRef}
          onCameraMove={handleCameraMove}
          onMapClick={() => {
            Keyboard.dismiss()
            setCitySearchInput("")
            setCities([])
          }}
        />
      )}

      <View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: "center",
          alignItems: "center",
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

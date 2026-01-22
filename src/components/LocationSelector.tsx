import React, { useEffect, useState } from "react"
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Keyboard,
  Modal,
  Pressable,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "@/src/utils/colors"
import { BASE_URL } from "@/src/utils/constants"
import Feather from "@expo/vector-icons/Feather"
import { userAtom } from "@/src/store/auth-store"
import { useAtomValue } from "jotai"
import { locSelecStyles } from "@/src/styles/location-selector.styles"
import { inputStyles } from "@/src/styles/input.styles"
import CustomInput from "./CustomInput"

interface City {
  _id: number
  name: string
  country_name: string
  state_name: string
  population: number
  latitude: number
  longitude: number
  timezone: string
  score: number
}

export default function LocationSelector({
  onLocationChange,
}: {
  onLocationChange: (locationObj: City) => void
}) {
  const user = useAtomValue(userAtom)
  const [locationInput, setLocationInput] = useState("Select Your Location")
  const [cities, setCities] = useState<City[]>([])
  const [showModal, setShowModal] = useState(false)
  const [citySearchInput, setCitySearchInput] = useState("")

  useEffect(() => {
    if (!user) return
    setLocationInput(`${user.city} (${user.state}, ${user.country})`)
  }, [user])

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

  async function handleSelect(city: City) {
    Keyboard.dismiss()
    setLocationInput(`${city.name} (${city.state_name}, ${city.country_name})`)
    setCitySearchInput("")
    setShowModal(false)
    onLocationChange(city)
  }

  return (
    <Pressable
      onPress={() => {
        setShowModal(true)
        setCitySearchInput("")
      }}
      style={{ width: "100%" }}
    >
      <CustomInput title="Location" editable={false} selectTextOnFocus={false} pointerEvents="none">
        {locationInput}
      </CustomInput>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={locSelecStyles.modalContainer}>
          <View style={locSelecStyles.searchContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false)
                setCitySearchInput("")
              }}
              style={locSelecStyles.dismissButton}
            >
              <Feather name="x" size={20} color={colors.dark} />
            </TouchableOpacity>
            <TextInput
              style={locSelecStyles.searchInput}
              placeholder="Search for a city"
              placeholderTextColor={colors.gray}
              value={citySearchInput}
              onChangeText={handleCitySearch}
              autoFocus
            />
          </View>

          <FlatList
            data={cities}
            keyExtractor={item => item._id.toString()}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)} style={locSelecStyles.cityItem}>
                <Text style={locSelecStyles.cityText}>
                  {item.name}{" "}
                  <Text style={locSelecStyles.stateCountryText}>
                    ({item.state_name}, {item.country_name})
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </Pressable>
  )
}

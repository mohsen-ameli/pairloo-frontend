import { useCallback, useEffect, useState } from "react"
import { View, TextInput, TouchableOpacity, Text, Keyboard, Modal, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "@/src/utils/colors"
import { BASE_URL } from "@/src/utils/constants"
import Feather from "@expo/vector-icons/Feather"
import { userAtom } from "@/src/store/auth-store"
import { useAtomValue } from "jotai"
import { locSelectStyles } from "@/src/styles/location-selector.styles"
import CustomInput from "./CustomInput"
import { City } from "@/src/types/city.types"
import { inputStyles } from "@/src/styles/input.styles"
import { FlashList } from "@shopify/flash-list"
import { commonStyles } from "@/src/styles/common.styles"
import { useFocusEffect } from "expo-router"

export default function LocationSelector({
  onLocationChange,
  mandatory = false,
  defaultValue = "Click to select city",
  errors,
}: {
  onLocationChange: (locationObj: City) => void
  defaultValue?: string
  mandatory?: boolean
  errors?: string
}) {
  const user = useAtomValue(userAtom)

  const [locationInput, setLocationInput] = useState(defaultValue)
  const [cities, setCities] = useState<City[]>([])
  const [showModal, setShowModal] = useState(false)
  const [citySearchInput, setCitySearchInput] = useState("")
  const [justLoaded, setJustLoaded] = useState(true)

  function cleanup() {
    setJustLoaded(true)
    setCities([])
    setShowModal(false)
    setCitySearchInput("")
  }

  useFocusEffect(
    useCallback(() => {
      setJustLoaded(true)

      return () => cleanup()
    }, [])
  )

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
      setJustLoaded(false)
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
    setCities([])
  }

  return (
    <Pressable
      onPress={() => {
        setShowModal(true)
        setCitySearchInput("")
      }}
      style={{ width: "100%" }}
    >
      <CustomInput
        title="Location"
        mandatory={mandatory}
        value={locationInput}
        editable={false}
        selectTextOnFocus={false}
        style={{ pointerEvents: "none" }}
      />
      {errors ? <Text style={inputStyles.errors}>{errors}</Text> : null}

      <Modal
        visible={showModal}
        animationType="fade"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={commonStyles.searchContainer}>
            <TouchableOpacity
              onPress={() => {
                cleanup()
              }}
              style={commonStyles.dismissButton}
            >
              <Feather name="x" size={20} color={colors.dark} />
            </TouchableOpacity>
            <TextInput
              style={commonStyles.searchInput}
              placeholder="Search for a city"
              placeholderTextColor={colors.gray}
              value={citySearchInput}
              onChangeText={handleCitySearch}
              autoFocus
            />
          </View>

          {cities.length === 0 && !justLoaded ? (
            <Text style={locSelectStyles.informationText}>No cities found</Text>
          ) : (
            <FlashList
              data={cities}
              keyExtractor={item => item._id.toString()}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={locSelectStyles.cityItem}
                >
                  <Text style={locSelectStyles.cityText}>
                    {item.name}{" "}
                    <Text style={locSelectStyles.stateCountryText}>
                      ({item.state_name}, {item.country_name})
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </Pressable>
  )
}

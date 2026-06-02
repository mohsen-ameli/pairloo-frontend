import { colors } from "@/src/utils/colors"
import { newUserAtom, authErrorsAtom } from "@/src/store/auth-store"
import Feather from "@expo/vector-icons/Feather"
import { useAtom, useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native"
import { flowAtom } from "@/src/store/pager-store"
import { isBlockedAtom } from "@/src/store/device-store"
import { SafeAreaView } from "react-native-safe-area-context"
import { FlashList } from "@shopify/flash-list"
import { commonStyles } from "@/src/styles/common.styles"
import allCountries from "@/assets/countries.json"
import CountryFlag from "react-native-country-flag"

type Country = (typeof allCountries)[0]

export default function PhoneNumber() {
  const [country, setCountry] = useState<Country>(allCountries[40])
  const [visible, setVisible] = useState<boolean>(false)
  const [newUser, setNewUser] = useAtom(newUserAtom)
  const [errors, setErrors] = useAtom(authErrorsAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const isBlocked = useAtomValue(isBlockedAtom)
  const [searchInput, setSearchInput] = useState("")
  const [countries, setCountries] = useState<Country[]>(allCountries as Country[])

  useEffect(() => {
    if (newUser.cca2 && newUser.cca2 !== country.cca2) {
      const selectedCountry = allCountries.find(c => c.cca2 === newUser.cca2)
      if (selectedCountry) {
        setCountry(selectedCountry)
      }
    }
  }, [newUser.cca2])

  function onSelect(country: Country) {
    setCountry(country)
    setNewUser({
      ...newUser,
      phoneVerified: false,
      country: country.name.toString(),
      cca2: country.cca2,
      callingCode: country.callingCode,
    })
    setCountries(allCountries)
  }

  function handleSearch(text: string) {
    setSearchInput(text)
    setCountries(allCountries.filter(c => c.name.toLowerCase().includes(text.toLowerCase())))
  }

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Button that shows the flag and calling code. clicking will open the modal */}
      <Pressable
        style={{
          borderWidth: 1,
          borderColor: colors.borderGray,
          paddingVertical: 16,
          paddingHorizontal: 10,
          borderRadius: 5,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
        onPress={() => setVisible(true)}
        disabled={isBlocked}
      >
        <CountryFlag isoCode={country.cca2} size={20} />
        <Text
          style={{
            fontSize: 16,
            color: colors.dark,
          }}
        >
          ({country?.callingCode})
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={commonStyles.modalContainer}>
          <View style={commonStyles.searchContainer}>
            <TouchableOpacity
              onPress={() => {
                setVisible(false)
                setSearchInput("")
              }}
              style={commonStyles.dismissButton}
            >
              <Feather name="x" size={26} color={colors.dark} />
            </TouchableOpacity>
            <TextInput
              style={commonStyles.searchInput}
              placeholder="Search for a country"
              placeholderTextColor={colors.gray}
              value={searchInput}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>

          <FlashList
            data={countries}
            keyExtractor={item => item.cca2}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => (
              <Pressable
                key={item.cca2}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                  marginBottom: 5,
                  borderBottomColor: colors.borderGray,
                  borderBottomWidth: 0.5,
                  backgroundColor: colors.light,
                }}
                onPress={() => {
                  onSelect(item)
                  setVisible(false)
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 10 }}>
                  <CountryFlag isoCode={item.cca2} size={20} />
                </Text>
                <Text style={{ fontSize: 18, color: colors.dark }}>
                  {item.name} ({item.callingCode})
                </Text>
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
      <TextInput
        style={{
          color: colors.dark,
          flexGrow: 1,
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: 15,
          borderRadius: 5,
          fontSize: 18,
        }}
        value={newUser.phoneNumber}
        editable={!isBlocked}
        autoFocus
        placeholder="4160001234"
        placeholderTextColor={colors.muted}
        autoComplete="off"
        keyboardType="number-pad"
        maxLength={14}
        defaultValue={newUser.phoneNumber}
        onChangeText={text => {
          setNewUser({
            ...newUser,
            phoneNumber: text.trim(),
            phoneVerified: false,
          })
          setErrors({ ...errors, phoneNumber: "" })
          setFlow({ ...flow, nextEnabled: text.trim().length > 0 })
        }}
      />
      {newUser.phoneNumber && (
        <Pressable
          style={{
            position: "absolute",
            right: 10,
            backgroundColor: colors.lightGray,
            padding: 5,
            borderRadius: 5,
          }}
          onPress={() => {
            setNewUser({ ...newUser, phoneNumber: "" })
            setErrors({ ...errors, phoneNumber: "" })
            setFlow({ ...flow, nextEnabled: false })
          }}
        >
          <Feather name="x" size={24} color={colors.darkGray} />
        </Pressable>
      )}
    </View>
  )
}

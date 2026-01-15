import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Keyboard,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Country, State, City } from "country-state-city";
import { colors } from "../utils/colors";

interface CountryCitySelectorProps {
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  selectedCountry: string;
  selectedCity: string;
}

export default function CountryCitySelector({
  onCountryChange,
  onCityChange,
  selectedCountry,
  selectedCity,
}: CountryCitySelectorProps) {
  const [countryInput, setCountryInput] = useState(selectedCountry);
  const [cityInput, setCityInput] = useState(selectedCity);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [countrySearchInput, setCountrySearchInput] = useState("");
  const [citySearchInput, setCitySearchInput] = useState("");

  const allCountries = Country.getAllCountries();

  useEffect(() => {
    if (countrySearchInput.length > 0) {
      const filtered = allCountries.filter((country) =>
        country.name.toLowerCase().includes(countrySearchInput.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(allCountries);
    }
  }, [countrySearchInput]);

  useEffect(() => {
    if (selectedCountryCode) {
      const cities = City.getCitiesOfCountry(selectedCountryCode) || [];
      if (citySearchInput.length > 0) {
        const filtered = cities.filter((city) =>
          city.name.toLowerCase().includes(citySearchInput.toLowerCase())
        );
        setFilteredCities(filtered);
      } else {
        setFilteredCities(cities);
      }
    }
  }, [citySearchInput, selectedCountryCode]);

  const handleCountrySelect = (country: any) => {
    setCountryInput(country.name);
    setSelectedCountryCode(country.isoCode);
    onCountryChange(country.name);
    setShowCountryModal(false);
    setCountrySearchInput("");
    setCityInput("");
    setCitySearchInput("");
    setFilteredCities([]);
    Keyboard.dismiss();
  };

  const handleCitySelect = (city: any) => {
    setCityInput(city.name);
    onCityChange(city.name);
    setShowCityModal(false);
    setCitySearchInput("");
    Keyboard.dismiss();
  };

  const handleCountryModalOpen = () => {
    setShowCountryModal(true);
    setCountrySearchInput("");
    setFilteredCountries(allCountries);
  };

  const handleCityModalOpen = () => {
    setShowCityModal(true);
    setCitySearchInput("");
  };

  return (
    <View>
      {/* Country Input */}
      <TouchableOpacity
        onPress={handleCountryModalOpen}
        style={{
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: 10,
          borderRadius: 5,
          width: "100%",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: countryInput ? colors.dark : colors.gray,
            fontSize: 16,
          }}
        >
          {countryInput || "Country"}
        </Text>
      </TouchableOpacity>

      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.borderGray }}>
            <TouchableOpacity
              onPress={() => {
                setShowCountryModal(false);
                setCountrySearchInput("");
              }}
              style={{ marginBottom: 10 }}
            >
              <Text style={{ color: colors.purple, fontSize: 16, fontWeight: "bold" }}>
                Close
              </Text>
            </TouchableOpacity>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.borderGray,
                padding: 10,
                borderRadius: 5,
                color: colors.dark,
              }}
              placeholder="Search countries..."
              placeholderTextColor={colors.gray}
              value={countrySearchInput}
              onChangeText={setCountrySearchInput}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.isoCode}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleCountrySelect(item)}
                style={{
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderGray,
                  backgroundColor: countryInput === item.name ? "#f0f0f0" : "white",
                }}
              >
                <Text style={{ color: colors.dark, fontSize: 16 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* City Input */}
      <TouchableOpacity
        onPress={handleCityModalOpen}
        disabled={!selectedCountryCode}
        style={{
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: 10,
          borderRadius: 5,
          width: "100%",
          opacity: selectedCountryCode ? 1 : 0.5,
        }}
      >
        <Text
          style={{
            color: cityInput ? colors.dark : colors.gray,
            fontSize: 16,
          }}
        >
          {cityInput || "City"}
        </Text>
      </TouchableOpacity>

      {/* City Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.borderGray }}>
            <TouchableOpacity
              onPress={() => {
                setShowCityModal(false);
                setCitySearchInput("");
              }}
              style={{ marginBottom: 10 }}
            >
              <Text style={{ color: colors.purple, fontSize: 16, fontWeight: "bold" }}>
                Close
              </Text>
            </TouchableOpacity>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.borderGray,
                padding: 10,
                borderRadius: 5,
                color: colors.dark,
              }}
              placeholder="Search cities..."
              placeholderTextColor={colors.gray}
              value={citySearchInput}
              onChangeText={setCitySearchInput}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleCitySelect(item)}
                style={{
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderGray,
                  backgroundColor: cityInput === item.name ? "#f0f0f0" : "white",
                }}
              >
                <Text style={{ color: colors.dark, fontSize: 16 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

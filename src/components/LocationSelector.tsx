import React, { useState } from "react";
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
import { colors } from "../utils/colors";
import { BASE_URL } from "../utils/constants";

interface City {
  _id: number;
  name: string;
  country_name: string;
  [key: string]: any;
}

interface LocationSelectorProps {
  onLocationChange: (city: string | City) => void;
  selectedCity: string;
}

export default function LocationSelector({ onLocationChange, selectedCity }: LocationSelectorProps) {
  const [locationInput, setLocationInput] = useState(selectedCity);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [citySearchInput, setCitySearchInput] = useState("");

  async function handleCitySearch(text: string) {
    setCitySearchInput(text);
    if (text.length < 2) {
      setFilteredCities([]);
      return;
    }
    try {
      const url = `${BASE_URL}/api/locations/search?q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      setFilteredCities(data);
    } catch (error) {
      setFilteredCities([]);
    }
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          setShowModal(true);
          setCitySearchInput("");
        }}
        style={{
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: 10,
          borderRadius: 5,
          width: "100%",
        }}
      >
        <Text
          style={{
            color: locationInput ? colors.dark : colors.gray,
            fontSize: 14,
          }}
        >
          {locationInput}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.borderGray }}>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
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
              onChangeText={handleCitySearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  const fullLocation = [item.name, item.state_name, item.country_name]
                    .filter(Boolean)
                    .join(", ");
                  setLocationInput(fullLocation);
                  onLocationChange(item);
                  setShowModal(false);
                  setCitySearchInput("");
                  Keyboard.dismiss();
                }}
                style={{
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderGray,
                }}
              >
                <Text style={{ color: colors.dark, fontSize: 16 }}>{item.name} <Text style={{ color: colors.gray, fontSize: 14 }}>({item.state_name}, {item.country_name})</Text></Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

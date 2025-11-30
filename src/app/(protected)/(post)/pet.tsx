import CustomInput from "@/src/components/CustomInput";
import { useLocalSearchParams } from "expo-router";
import {
  Keyboard,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import SubmitButton from "./submit";

export default function Pet() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  if (params.action == "need") return <Need />;
  return <Provide />;
}

function Need() {
  return (
    <ScrollView
      contentContainerStyle={{
        // flex: 1,
        gap: 30,
        margin: 20,
        paddingBottom: 50,
        alignItems: "center",
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
        }}
      >
        Pet Information
      </Text>
      <CustomInput placeholder="Animal Type" />
      <CustomInput placeholder="Breed" />
      <CustomInput placeholder="Skin Colour" />
      <CustomInput placeholder="Gender" />
      <CustomInput placeholder="Price Range" />
      <CustomInput placeholder="Age" />
      <CustomInput placeholder="Vaccinated or something?" />
      <SubmitButton />
    </ScrollView>
  );
}

function Provide() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          flex: 1,
          gap: 30,
          margin: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          Pet Information
        </Text>
        <CustomInput placeholder="Animal Type" />
        <CustomInput placeholder="Breed" />
        <CustomInput placeholder="Skin Colour" />
        <CustomInput placeholder="Gender" />
        <CustomInput placeholder="Price Range" />
        <CustomInput placeholder="Age" />
        <CustomInput placeholder="Vaccinated or something?" />
        <SubmitButton />
      </View>
    </TouchableWithoutFeedback>
  );
}

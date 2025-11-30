import CustomInput from "@/src/components/CustomInput";
import { useLocalSearchParams } from "expo-router";
import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import SubmitButton from "./submit";

export default function Product() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  if (params.action == "need") return <Need />;
  return <Provide />;
}

function Need() {
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
          Product Information
        </Text>
        <CustomInput placeholder="Name of Product" />
        <CustomInput placeholder="Quantity" />
        <CustomInput placeholder="Price Range" />
        <CustomInput placeholder="Condition" />
        <CustomInput placeholder="Date Manufactured" />
        <CustomInput placeholder="Extra Information" />
        <SubmitButton />
      </View>
    </TouchableWithoutFeedback>
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
          Product Information
        </Text>
        <CustomInput placeholder="Name of Product" />
        <CustomInput placeholder="Quantity" />
        <CustomInput placeholder="Price Range" />
        <CustomInput placeholder="Condition" />
        <CustomInput placeholder="Date Manufactured" />
        <CustomInput placeholder="Extra Information" />
        <SubmitButton />
      </View>
    </TouchableWithoutFeedback>
  );
}

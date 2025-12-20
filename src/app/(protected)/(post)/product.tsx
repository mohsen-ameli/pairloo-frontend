import CustomInput from "@/src/components/CustomInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import SubmitButton from "./submit";
import { useSetAtom } from "jotai";
import { authFetchAtom } from "@/src/utils/auth-fetch";
import { useRef } from "react";

export default function Product() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  if (params.action == "need") return <Need />;
  return <Provide />;
}

function Need() {
  const router = useRouter();
  const authFetch = useSetAtom(authFetchAtom);
  const data = useRef<{
    category?: string;
    name?: string;
    region?: string;
    quantity?: string;
    price?: string;
  }>({});

  async function onSubmit() {
    const res = await authFetch("/api/posts/products", {
      method: "POST",
      body: JSON.stringify({
        type: "need",
        ...data.current,
      }),
    });
    if (res.ok) {
      alert("Product request submitted successfully");
      // router.replace("/")
    }
  }

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
        <CustomInput
          placeholder="Category"
          onChangeText={(text) => (data.current.category = text)}
        />
        <CustomInput
          placeholder="Name of Product"
          onChangeText={(text) => (data.current.name = text)}
        />
        <CustomInput
          placeholder="Region"
          onChangeText={(text) => (data.current.region = text)}
        />
        <CustomInput
          placeholder="Quantity"
          onChangeText={(text) => (data.current.quantity = text)}
        />
        <CustomInput
          placeholder="Price"
          onChangeText={(text) => (data.current.price = text)}
        />
        {/* <CustomInput placeholder="Condition" /> */}
        {/* <CustomInput placeholder="Date Manufactured" /> */}
        {/* <CustomInput placeholder="Extra Information" /> */}
        <SubmitButton text="Submit" onPress={onSubmit} />
      </View>
    </TouchableWithoutFeedback>
  );
}

function Provide() {
  async function onSubmit() {}

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
        <CustomInput placeholder="Category" />
        <CustomInput placeholder="Name of Product" />
        <CustomInput placeholder="Quantity" />
        <CustomInput placeholder="Price Range" />
        <CustomInput placeholder="Condition" />
        <CustomInput placeholder="Date Manufactured" />
        <CustomInput placeholder="Description" />
        <SubmitButton text="Submit" onPress={onSubmit} />
      </View>
    </TouchableWithoutFeedback>
  );
}

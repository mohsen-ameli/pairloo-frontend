import CustomInput from "@/src/components/CustomInput";
import { Link, useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { colors } from "../utils/colors";
import { loginAtom, userAtom } from "../utils/store";

export default function LoginPage() {
  const login = useSetAtom(loginAtom);
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const [email, setEmail] = useState("");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ padding: 20, gap: 10, flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 30,
            marginBottom: 20,
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          Log In
        </Text>
        <CustomInput
          placeholder="Email"
          onChangeText={setEmail}
          textContentType="username"
          autoComplete="username"
        />
        <CustomButton
          text="Continue"
          disabled={!email}
          onPress={async () => {
            if (!email) {
              Alert.alert("Error", "Please enter your email");
              return;
            }

            try {
              await login(email);
              router.replace("/");
            } catch {
              Alert.alert("Login Failed", "Invalid username or password");
            }
          }}
        />
        <Link push href="/forgot-password" style={{ color: colors.purple }}>
          Forgot password?
        </Link>
      </View>
    </TouchableWithoutFeedback>
  );
}

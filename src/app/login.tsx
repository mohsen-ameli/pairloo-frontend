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
import { logInAtom, userAtom } from "../utils/store";

export default function LoginPage() {
  const login = useSetAtom(logInAtom);
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
          placeholder="Email or username"
          onChangeText={setUsername}
          textContentType="username"
          autoComplete="username"
        />
        <CustomInput
          placeholder="Password"
          onChangeText={setPassword}
          textContentType="newPassword"
          autoComplete="new-password"
          secureTextEntry
        />
        <CustomButton
          text="Continue"
          disabled={!username || !password}
          onPress={() => {
            const success = login(username, password);
            if (!username || !password) {
              Alert.alert("Error", "Please enter both username and password");
              return;
            }

            if (success) {
              router.replace("/(protected)/(post)");
            } else {
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

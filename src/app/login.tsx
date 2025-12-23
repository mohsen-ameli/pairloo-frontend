import CustomInput from "@/src/components/CustomInput";
import { Link, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { useRef } from "react";
import {
  Alert,
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { colors } from "../utils/colors";
import { BASE_URL } from "../utils/constants";
import useCustomPager from "../components/CustomPager";
import { userAtom } from "../utils/store";

export default function LoginPage() {
  const email = useRef<string | null>(null);
  const verificationCode = useRef<string | null>(null);
  const { setCurrPage, setPage, setLocks, Pager } = useCustomPager({
    pageCount: 2,
    pageLocks: [false, true],
  });
  const requested = useRef(false);
  const setUser = useSetAtom(userAtom);
  const router = useRouter();

  async function handleRequest() {
    if (email.current === null) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    requested.current = true;

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/request-email-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.current,
          }),
        }
      );
      setLocks([false, false]);
      setCurrPage(1);
      setPage(1);
      requested.current = false;
      if (!res.ok) {
        Alert.alert(
          "Note",
          "You have already requested a code. Please check your email."
        );
      }
    } catch {
      Alert.alert("Login Failed", "Invalid username or password");
    }
  }

  async function handleVerification() {
    if (verificationCode.current === null) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-email-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.current,
          code: verificationCode.current,
        }),
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        router.replace("/");
      } else {
        Alert.alert("Login Failed", "Invalid verification code");
      }
    } catch {
      Alert.alert("Login Failed", "Invalid verification code");
    }
  }

  return (
    <Pager>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{ padding: 20, gap: 10, flex: 1, justifyContent: "center" }}
        >
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
            onChangeText={(text) => (email.current = text)}
            textContentType="username"
            autoComplete="username"
          />
          <CustomButton
            text="Continue"
            disabled={!email || requested.current}
            onPress={handleRequest}
          />
          <Link push href="/forgot-email" style={{ color: colors.purple }}>
            Forgot email?
          </Link>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{ padding: 20, gap: 10, flex: 1, justifyContent: "center" }}
        >
          <Text
            style={{
              fontSize: 30,
              marginBottom: 20,
              fontWeight: "bold",
              alignSelf: "center",
            }}
          >
            Enter Verification Code
          </Text>
          <CustomInput
            placeholder="6-digit code"
            onChangeText={(text) => (verificationCode.current = text)}
            keyboardType="numeric"
            maxLength={6}
          />
          <CustomButton
            text="Log In"
            disabled={!verificationCode}
            onPress={handleVerification}
          />
        </View>
      </TouchableWithoutFeedback>
    </Pager>
  );
}

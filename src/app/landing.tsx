import CustomLink from "@/src/components/CustomLink";
import { colors } from "@/src/utils/colors";
import {
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { Link } from "expo-router";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Text, View } from "react-native";
import CustomButton from "../components/CustomButton";
import { userAtom } from "../utils/store";

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_SERVER_URL}/api/auth/authorize`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_SERVER_URL}/api/auth/token`,
};

export default function Landing() {
  const [user, setUser] = useAtom(userAtom);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);

  useEffect(() => {
    handleResponse();
  }, [response]);

  async function handleResponse() {
    if (response?.type === "success") {
      const { code } = response.params;

      console.log(code);
    } else {
      console.log("Authentication failed or was cancelled");
    }
  }

  async function signInWithGoogle() {
    try {
      if (!request) {
        console.log("no request");
        return;
      }
      await promptAsync();
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
    // const res = await fetch(process.env.EXPO_PUBLIC_SERVER_URL!);
    // const data = await res.json();
    // console.log(data);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 120,
        marginBottom: 30,
        padding: 20,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          marginHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 50,
            fontWeight: "bold",
          }}
        >
          Matcher
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Connect with people automatically
        </Text>
      </View>

      <View style={{ width: "100%", gap: 20 }}>
        <CustomLink text="Create account" href="/register" />
        <Link href="/login">
          <Text
            style={{ color: colors.purple, textAlign: "center", fontSize: 20 }}
          >
            Log in
          </Text>
        </Link>
        <CustomButton
          text="Login With Google"
          onPress={() => {
            signInWithGoogle();
          }}
        />
      </View>
    </View>
  );
}

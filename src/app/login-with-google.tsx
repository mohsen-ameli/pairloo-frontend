import {
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import CustomButton from "../components/CustomButton";
import { userAtom } from "../utils/store";
import { BASE_URL } from "../utils/constants";

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

export default function LoginWithGoogle({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) {
  const setUser = useSetAtom(userAtom);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const router = useRouter();

  async function handleResponse() {
    if (!response || response.type !== "success") {
      setLoading(false);
      return;
    }

    const tokenRes = await fetch(`${BASE_URL}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: response.params.code,
        platform: Platform.OS === "web" ? "web" : "native",
      }),
    });
    const userData = await tokenRes.json();

    setUser(userData);

    router.replace("/");
  }

  useEffect(() => {
    handleResponse();
  }, [response]);

  async function signInWithGoogle() {
    try {
      if (request) {
        setLoading(true);
        await promptAsync();
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setLoading(false);
    }
  }

  return (
    <View>
      <CustomButton onPress={signInWithGoogle}>Login With Google</CustomButton>
    </View>
  );
}

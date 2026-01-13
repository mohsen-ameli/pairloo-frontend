import {
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import CustomButton from "../components/CustomButton";
import { newUserAtom, userAtom } from "../utils/store";
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

export default function ContinueWithGoogle({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) {
  const setUser = useSetAtom(userAtom);
  const [newUser, setNewUser] = useAtom(newUserAtom);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const router = useRouter();

  async function handleResponse() {
    if (!response || response.type !== "success") {
      setLoading(false);
      return;
    }

    const res = await fetch(`${BASE_URL}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: response.params.code,
        platform: Platform.OS === "web" ? "web" : "native",
      }),
    });

    // If user not found, redirect to registration with prefilled data
    if (res.status === 409) {
      const userData = await res.json();
      setLoading(false);
      setNewUser({ ...newUser, ...userData });
      router.push("/register");
      return;
    }

    const userData = await res.json();

    setUser(userData);

    router.replace("/");
  }

  useEffect(() => {
    handleResponse();
  }, [response]);

  async function continueWithGoogle() {
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
      <CustomButton onPress={continueWithGoogle}>
        Continue With Google
      </CustomButton>
    </View>
  );
}

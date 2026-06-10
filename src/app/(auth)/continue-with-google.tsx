import {
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session"
import { useRouter } from "expo-router"
import { useAtom, useSetAtom } from "jotai"
import { useEffect } from "react"
import { Platform } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { newUserAtom, NewUserType, userSecureAtom } from "@/src/store/auth-store"
import { BASE_URL } from "@/src/utils/constants"
import { AuthResponseType } from "@/src/types/user.type"
import { greetAtom } from "@/src/store/general-store"

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
}

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
}

export default function ContinueWithGoogle({
  setLoading,
}: {
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const setUserJwt = useSetAtom(userSecureAtom)
  const [newUser, setNewUser] = useAtom(newUserAtom)
  const [request, response, promptAsync] = useAuthRequest(config, discovery)
  const setGreet = useSetAtom(greetAtom)

  async function handleResponse() {
    if (!response || response.type !== "success") {
      setLoading(false)
      return
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
      credentials: Platform.OS === "web" ? "include" : "same-origin",
    })

    // If user not found, redirect to registration with prefilled data
    if (res.status === 409) {
      const userData: Partial<NewUserType> = await res.json()
      setLoading(false)
      setNewUser({ ...newUser, ...userData })
      router.push("/register")
      return
    }

    const userData: AuthResponseType = await res.json()

    await setUserJwt({
      _id: userData._id,
      isAuthenticated: true,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
    })

    setGreet(curr => !curr)
    router.replace("/")

    return
  }

  useEffect(() => {
    handleResponse()
  }, [response])

  async function continueWithGoogle() {
    try {
      if (request) {
        setLoading(true)
        await promptAsync()
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error)
      setLoading(false)
    }
  }

  return <CustomButton onPress={continueWithGoogle}>Continue With Google</CustomButton>
}

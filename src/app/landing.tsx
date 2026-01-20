import CustomLink from "@/src/components/CustomLink"
import { colors } from "@/src/utils/colors"
import { Link } from "expo-router"
import { Text, View } from "react-native"
import ContinueWithGoogle from "./continue-with-google"
import { useState } from "react"
import LoadingIndicator from "@/src/components/LoadingIndicator"

export default function Landing() {
  const [loading, setLoading] = useState(false)

  return (
    <>
      <LoadingIndicator loading={loading} />

      <View
        style={{
          flex: 1,
          backgroundColor: colors.lightBackground,
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 120,
          paddingBottom: 30,
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
              color: colors.dark,
              fontSize: 50,
              fontWeight: "bold",
            }}
          >
            Matcher
          </Text>
          <Text
            style={{
              color: colors.dark,
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Connect with people automatically
          </Text>
        </View>

        <View style={{ width: "100%", gap: 20 }}>
          <CustomLink href="/register">Create account</CustomLink>
          <Link href="/login">
            <Text
              style={{
                color: colors.purple,
                textAlign: "center",
                fontSize: 20,
              }}
            >
              Log in
            </Text>
          </Link>
          <ContinueWithGoogle setLoading={setLoading} />
        </View>
      </View>
    </>
  )
}

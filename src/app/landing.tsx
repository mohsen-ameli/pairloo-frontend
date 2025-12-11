import CustomLink from "@/src/components/CustomLink";
import { colors } from "@/src/utils/colors";
import { Link } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import LoginWithGoogle from "./login-with-google";
import { useState } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "../utils/store";

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const user = useAtomValue(userAtom);

  return (
    <>
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
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
              style={{
                color: colors.purple,
                textAlign: "center",
                fontSize: 20,
              }}
            >
              Log in
            </Text>
          </Link>
          <LoginWithGoogle setLoading={setLoading} />
        </View>
      </View>
    </>
  );
}

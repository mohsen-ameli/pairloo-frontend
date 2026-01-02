import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import React from "react";
import { userAtom } from "../utils/store";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();

export default function RootLayout() {
  const user = useAtomValue(userAtom);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Protected guard={user !== null}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={user === null}>
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="register" />
          <Stack.Screen name="login" />
          <Stack.Screen name="forgot-email" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

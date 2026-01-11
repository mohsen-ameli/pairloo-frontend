import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import React from "react";
import { userAtom } from "../utils/store";
import { LogBox, Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";

LogBox.ignoreAllLogs();

export default function RootLayout() {
  const user = useAtomValue(userAtom);
  const queryClient = new QueryClient();

  return (
    <>
      <StatusBar style={Platform.OS === "ios" ? "inverted" : "auto"} />
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <Stack>
            <Stack.Protected guard={user !== null}>
              <Stack.Screen
                name="(protected)"
                options={{ headerShown: false }}
              />
            </Stack.Protected>
            <Stack.Protected guard={user === null}>
              <Stack.Screen name="landing" options={{ headerShown: false }} />
              <Stack.Screen name="register" />
              <Stack.Screen name="login" />
              <Stack.Screen
                name="forgot-email"
                options={{ headerShown: false }}
              />
            </Stack.Protected>
          </Stack>
        </KeyboardProvider>
      </QueryClientProvider>
    </>
  );
}

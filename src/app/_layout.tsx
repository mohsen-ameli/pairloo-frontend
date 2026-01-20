import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import React from "react";
import { userAtom } from "../store/auth-store";
import { LogBox, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { colors } from "../utils/colors";
import { maybeCompleteAuthSession } from "expo-web-browser";

LogBox.ignoreAllLogs();
maybeCompleteAuthSession();

export default function RootLayout() {
  const user = useAtomValue(userAtom);
  const queryClient = new QueryClient();

  return (
    <>
      <StatusBar style="auto" />
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerBackButtonDisplayMode: "minimal",
              headerTitleStyle: { color: colors.dark },
              headerStyle: { backgroundColor: colors.light },
              headerTintColor: colors.dark,
            }}
          >
            <Stack.Protected guard={user !== null}>
              <Stack.Screen
                name="(protected)"
                options={{ headerShown: false }}
              />
            </Stack.Protected>
            <Stack.Protected guard={user === null}>
              <Stack.Screen name="landing" options={{ headerShown: false }} />
              <Stack.Screen
                name="register"
                options={{ title: "Create Account" }}
              />
              <Stack.Screen name="login" options={{ title: "Log In" }} />
              <Stack.Screen
                name="forgot-email"
                options={{ title: "Forgot Email" }}
              />
            </Stack.Protected>
          </Stack>
        </QueryClientProvider>
      </KeyboardProvider>
    </>
  );
}

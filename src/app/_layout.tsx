import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import React from "react";
import { userAtom } from "../utils/store";
import { LogBox, Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { colors } from "../utils/colors";

LogBox.ignoreAllLogs();

export default function RootLayout() {
  const user = useAtomValue(userAtom);
  const queryClient = new QueryClient();

  return (
    <>
      <StatusBar style="auto" />
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
              <Stack.Screen
                name="landing"
                options={{
                  headerShown: false,
                  headerStyle: {
                    backgroundColor: colors.lightBackground,
                  },
                }}
              />
              <Stack.Screen
                name="register"
                options={{
                  title: "Create Account",
                  headerTitleStyle: {
                    color: colors.dark,
                  },
                  headerStyle: {
                    backgroundColor: colors.lightBackground,
                  },
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  title: "Log In",
                  headerTitleStyle: {
                    color: colors.dark,
                  },
                  headerStyle: {
                    backgroundColor: colors.lightBackground,
                  },
                }}
              />
              <Stack.Screen
                name="forgot-email"
                options={{
                  headerShown: false,
                  headerStyle: {
                    backgroundColor: colors.lightBackground,
                  },
                }}
              />
            </Stack.Protected>
          </Stack>
        </KeyboardProvider>
      </QueryClientProvider>
    </>
  );
}

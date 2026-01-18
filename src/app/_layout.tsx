import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { userAtom } from "../store/auth-store";
import { LogBox, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { colors } from "../utils/colors";
import { maybeCompleteAuthSession } from "expo-web-browser";
import Toast from "react-native-toast-message";
import CustomToast from "../components/CustomToast";

import { useAudioPlayer } from "expo-audio";
import { notificationSoundAtom } from "../store/general-store";

const audioSource = require("@/assets/audio/new-notification.mp3");

LogBox.ignoreAllLogs();
maybeCompleteAuthSession();

const toastConfig = {
  newMessage: ({
    props,
    onPress,
  }: {
    props: {
      username: string;
      message: string;
      picture?: string;
    };
    onPress: () => void;
  }) => {
    return <CustomToast {...props} onPress={onPress} />;
  },
};

export default function RootLayout() {
  const user = useAtomValue(userAtom);
  const queryClient = new QueryClient();
  const player = useAudioPlayer(audioSource);
  const setNotificationSound = useSetAtom(notificationSoundAtom);

  useEffect(() => {
    setNotificationSound(player);
  }, []);

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

      <Toast config={toastConfig} />
    </>
  );
}

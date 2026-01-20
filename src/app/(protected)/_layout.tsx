import { initChatAtom } from "@/src/store/chat-store";
import { initCreatePostAtom } from "@/src/store/create-post-store";
import { colors } from "@/src/utils/colors";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { View } from "react-native";

export default function ProtectedLayout() {
  const initChatConnection = useSetAtom(initChatAtom);
  const initCreatePost = useSetAtom(initCreatePostAtom);

  useEffect(() => {
    async function initialize() {
      await initChatConnection();
      await initCreatePost();
    }
    initialize();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.purple,
        tabBarBackground() {
          return <View style={{ backgroundColor: colors.light, flex: 1 }} />;
        },
      }}
    >
      <Tabs.Screen
        name="(post)"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-posts"
        options={{
          title: "My Posts",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          title: "Create Post",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarBadge: 2,
          tabBarBadgeStyle: {
            backgroundColor: "tomato",
            color: "white",
          },
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

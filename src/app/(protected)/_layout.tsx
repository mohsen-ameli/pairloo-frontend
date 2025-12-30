import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "limegreen" }}>
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
        name="new-post"
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

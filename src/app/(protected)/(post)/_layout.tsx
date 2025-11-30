import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="select" options={{ title: "Select" }} />
      <Stack.Screen name="category" options={{ title: "Category" }} />
      <Stack.Screen name="job" options={{ title: "Job" }} />
      <Stack.Screen name="partner" options={{ title: "Partner" }} />
      <Stack.Screen name="pet" options={{ title: "Pet" }} />
      <Stack.Screen name="product" options={{ title: "Product" }} />
      <Stack.Screen name="something" options={{ title: "Something Else" }} />
    </Stack>
  );
}

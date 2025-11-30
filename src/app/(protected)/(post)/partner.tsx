import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TextInput, View } from "react-native";

export default function Job() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  return (
    <ScrollView>
      <View
        style={{
          gap: 10,
          margin: 20,
        }}
      >
        <Text>
          I {params.action} a {params.category}
        </Text>
        <Text>Part 1: About You</Text>

        <View>
          <Text>Personal Information</Text>
          <Text>Photo Upload Area</Text>
          <TextInput placeholder="First Name" />
          <TextInput placeholder="Last Name" />
          <TextInput placeholder="Phone Number" />
          <TextInput placeholder="Height" />
          <TextInput placeholder="Weight" />
          <TextInput placeholder="Gender" />
          <TextInput placeholder="Sexual Orientation" />
          <TextInput placeholder="Hobbies" />
          <TextInput placeholder="Education" />
          <TextInput placeholder="Work" />
        </View>
      </View>
    </ScrollView>
  );
}

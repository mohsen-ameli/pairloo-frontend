import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TextInput, View } from "react-native";

export default function Something() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  return (
    <ScrollView>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          margin: 20,
        }}
      >
        <Text>
          I {params.action} a {params.category}
        </Text>
        <Text>Just start typing what you {params.action}</Text>

        <TextInput />
      </View>
    </ScrollView>
  );
}

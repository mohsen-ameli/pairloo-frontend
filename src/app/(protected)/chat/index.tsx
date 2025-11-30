import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function index() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/users`);
      const users = await res.json();
      console.log("Users:", users);
      setData(users);
    }
    // fetchData();

    function startChat() {
      const ws = new WebSocket("ws://192.168.0.173:3001");
      ws.onopen = () => {
        console.log("WebSocket connection opened");
        ws.send("Hello Server!");
      };
    }
    // startChat();
  }, []);
  return (
    <View>
      <Text>start chatting NOW</Text>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}

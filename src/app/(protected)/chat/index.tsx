import CustomButton from "@/src/components/CustomButton";
import CustomHeader from "@/src/components/CustomHeader";
import { WS_BASE_URL } from "@/src/utils/constants";
import { useState } from "react";
import { Text, View } from "react-native";
import io from "socket.io-client";

export default function index() {
  const [data, setData] = useState([]);

  function startChat() {
    console.log("attempting ");
    const socket = io(WS_BASE_URL);
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      // ws.emit("message", "Hello Server!");
    });
    socket.on("message", (message: string) => {
      console.log("Received message from server:", message);
    });
  }

  return (
    <View>
      <CustomHeader title="Chat" />

      <Text>start chatting NOW</Text>
      <Text>{JSON.stringify(data)}</Text>
      <CustomButton onPress={() => startChat()}>Start Chat</CustomButton>
    </View>
  );
}

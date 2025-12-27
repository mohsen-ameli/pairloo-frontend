import CustomButton from "@/src/components/CustomButton";
import { BASE_URL } from "@/src/utils/constants";
import { useState } from "react";
import { Text, View } from "react-native";
import { connect } from "socket.io-client";

export default function index() {
  const [data, setData] = useState([]);

  function startChat() {
    console.log("attempting ");
    // const ws = io(process.env.EXPO_PUBLIC_WS_SERVER_URL!);
    const socket = connect(BASE_URL);
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
      <Text>start chatting NOW</Text>
      <Text>{JSON.stringify(data)}</Text>
      <CustomButton onPress={() => startChat()}>Start Chat</CustomButton>
    </View>
  );
}

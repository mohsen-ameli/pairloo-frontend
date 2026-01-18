import { atom } from "jotai";
import { userAtom } from "./auth-store";
import { WS_BASE_URL } from "../utils/constants";
import { createPostSocketAtom } from "./socket-store";
import { refreshAccessToken } from "../utils/refresh-access-token";
import io from "socket.io-client";

// To prevent multiple initializations
const initializedAtom = atom(false);

export const initCreatePostAtom = atom(null, async (get, set) => {
  const user = await get(userAtom);
  if (!user) return;
  const initialized = get(initializedAtom);
  if (initialized) return;
  set(initializedAtom, true);

  const socket = io(WS_BASE_URL + "/create-post", {
    auth: {
      token: user.accessToken,
    },
  });

  set(createPostSocketAtom, socket);

  socket.on("connect", () => {
    console.log("Connected to WebSocket server for create-post");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server for chatting");
  });

  socket.on("error", (err: any) => {
    console.error("WebSocket error event:", err);
  });

  socket.on("connect_error", async () => {
    const accessToken = await refreshAccessToken(user.refreshToken);
    if (accessToken === null) {
      socket.disconnect();
      set(userAtom, null);
      return;
    }
    await set(userAtom, { ...user, accessToken });
    socket.io.opts.auth = { token: accessToken };
    socket.connect();
  });
});

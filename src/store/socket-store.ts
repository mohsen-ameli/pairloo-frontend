import { atom } from "jotai";

export const chatSocketAtom = atom<SocketIOClient.Socket | null>(null);

export const createPostSocketAtom = atom<SocketIOClient.Socket | null>(null);

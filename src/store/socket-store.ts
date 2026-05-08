import { atom } from "jotai"
import { Socket } from "socket.io-client"
import { ChatClientSocket } from "../types/socket/chat.type"

export const chatSocketAtom = atom<ChatClientSocket | null>(null)

export const createPostSocketAtom = atom<Socket | null>(null)

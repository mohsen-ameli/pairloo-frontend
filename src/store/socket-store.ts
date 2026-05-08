import { atom } from "jotai"
import { ChatClientSocket } from "../types/socket/chat.type"
import { CreatePostClientSocket } from "../types/socket/create-post-socket.types"

export const chatSocketAtom = atom<ChatClientSocket | null>(null)

export const createPostSocketAtom = atom<CreatePostClientSocket | null>(null)

import { AudioPlayer } from "expo-audio"
import { atom } from "jotai"

export const pathStore = atom("")

export const notificationSoundAtom = atom<AudioPlayer | null>(null)

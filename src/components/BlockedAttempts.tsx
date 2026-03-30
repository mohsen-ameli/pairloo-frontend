import { blockedTimerAtom } from "@/src/store/device-store"
import { useAtomValue } from "jotai"

export default function BlockedAttempts() {
  const blockedTimer = useAtomValue(blockedTimerAtom)

  if (!blockedTimer) return ""

  return `Too many attempts. Try again in ${Math.floor(blockedTimer / 60)}:${blockedTimer % 60 < 10 ? "0" : ""}${blockedTimer % 60} ${blockedTimer > 60 ? "minutes" : "seconds"}.`
}

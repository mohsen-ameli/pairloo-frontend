import { AuthResponseType } from "../types/user.type"
import { BASE_URL } from "./constants"

// Refresh the access token. If `refreshToken` is provided, send it in the body
// (used by native). If omitted, call the endpoint with cookies (used by web).
export async function refreshAccessToken(refreshToken?: string) {
  const opts: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }

  if (refreshToken) {
    opts.body = JSON.stringify({ refreshToken })
  } else {
    // Ensure cookies are sent for web flows
    opts.credentials = "include"
  }

  try {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh-token`, opts)
    if (!refreshRes.ok) {
      return null
    }
    const data: AuthResponseType = await refreshRes.json()
    return data
  } catch (e) {
    return null
  }
}

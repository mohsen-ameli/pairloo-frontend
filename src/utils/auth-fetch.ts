import { atom } from "jotai"
import { logOutAtom, userJwtAtom } from "@/src/store/auth-store"
import { BASE_URL } from "./constants"
import { fetch, FetchRequestInit } from "expo/fetch"
import { refreshAccessToken } from "./refresh-access-token"

export const authFetchAtom = atom(
  null,
  async (get, set, url: string, options: FetchRequestInit = {}) => {
    // Attach access token
    const fetchWithToken = (token: string) =>
      fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

    const user = await get(userJwtAtom)

    if (!user) {
      throw new Error("User is not authenticated")
    }

    let res
    try {
      res = await fetchWithToken(user.accessToken)
    } catch (error) {
      throw new Error("Network error occurred")
    }

    if (res.status === 401 || res.status === 403) {
      const accessToken = await refreshAccessToken(user.refreshToken)

      if (accessToken !== null) {
        set(userJwtAtom, { ...user, accessToken })
        res = await fetchWithToken(accessToken)
      } else {
        set(logOutAtom)
        throw new Error("Session expired. Please log in again.")
      }
    }

    return res
  }
)

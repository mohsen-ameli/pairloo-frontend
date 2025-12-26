import { atom } from "jotai";
import { userAtom } from "./store";
import { BASE_URL } from "./constants";

export const authFetchAtom = atom(
  null,
  async (get, set, url: string, options: RequestInit = {}) => {
    // Attach access token
    const fetchWithToken = (token: string) =>
      fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

    const user = await get(userAtom);

    if (!user) {
      throw new Error("User is not authenticated");
    }

    let res = await fetchWithToken(user.accessToken);

    if (res.status === 401 || res.status === 403) {
      // Try to refresh token
      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        // Update user
        set(userAtom, { ...user, accessToken });
        // Retry original request
        res = await fetchWithToken(accessToken);
      } else {
        // Refresh failed, log out user
        set(userAtom, null);
        throw new Error("Session expired. Please log in again.");
      }
    }

    return res;
  }
);

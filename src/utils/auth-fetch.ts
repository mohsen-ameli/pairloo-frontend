import { atom } from "jotai";
import { userAtom } from "./store";
import { BASE_URL } from "./constants";
import { fetch, FetchRequestInit } from "expo/fetch";
import { refreshAccessToken } from "./refresh-access-token";

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
      });

    const user = await get(userAtom);

    if (!user) {
      throw new Error("User is not authenticated");
    }

    let res = await fetchWithToken(user.accessToken);

    if (res.status === 401 || res.status === 403) {
      const accessToken = await refreshAccessToken(user.refreshToken);

      if (accessToken !== null) {
        set(userAtom, { ...user, accessToken });
        res = await fetchWithToken(accessToken);
      } else {
        set(userAtom, null);
        throw new Error("Session expired. Please log in again.");
      }
    }

    return res;
  }
);

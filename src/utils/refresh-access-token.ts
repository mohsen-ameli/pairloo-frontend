import { BASE_URL } from "./constants";

// Refresh the access token using the provided refresh token
export async function refreshAccessToken(refreshToken: string) {
  const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) {
    return null;
  }

  const { accessToken } = (await refreshRes.json()) as { accessToken: string };
  return accessToken;
}

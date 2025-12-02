import { atom } from "jotai";
import { authFetchAtom } from "./auth-fetch";
import { userAtom } from "./store";

export const getUserInfoAtom = atom(null, async (get, set) => {
  const res = await set(authFetchAtom, "/api/get-user");
  const data = await res.json();
  const user = await get(userAtom);
  set(userAtom, {
    ...user,
    ...data,
  });
  return data;
});

import { cookies } from "next/headers";

const COOKIE_NAME = "mirage_gestor";
const COOKIE_VALUE = "ok";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export async function isManagerAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export async function setManagerSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearManagerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

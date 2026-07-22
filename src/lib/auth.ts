import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "estetica_gestor_session";
const SESSION_HOURS = 12;

export type SessionUser = {
  userId: string;
  companyId: string;
  email: string;
  name: string;
  role: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET ausente ou curto demais. Defina no .env (mín. 16 chars).",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      active: true,
    },
  });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return {
    userId: user.id,
    companyId: user.companyId,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    companyId: user.companyId,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(getSecret());
}

export async function readSessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.companyId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      companyId: payload.companyId,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      role: typeof payload.role === "string" ? payload.role : "MANAGER",
    };
  } catch {
    return null;
  }
}

export async function setManagerSession(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearManagerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function isManagerAuthenticated(): Promise<boolean> {
  return Boolean(await getSession());
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/** Compat: valida credenciais e retorna sessão (substitui admin/admin hardcoded). */
export async function validateCredentials(
  username: string,
  password: string,
): Promise<SessionUser | null> {
  return loginWithPassword(username, password);
}

export { COOKIE_NAME };

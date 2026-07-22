import { NextResponse } from "next/server";
import {
  clearManagerSession,
  setManagerSession,
  validateCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    email?: string;
    password?: string;
  };

  const login = (body.email ?? body.username ?? "").trim();
  const user = await validateCredentials(login, body.password ?? "");
  if (!user) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos" },
      { status: 401 },
    );
  }

  await setManagerSession(user);
  return NextResponse.json({
    ok: true,
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    },
  });
}

export async function DELETE() {
  await clearManagerSession();
  return NextResponse.json({ ok: true });
}

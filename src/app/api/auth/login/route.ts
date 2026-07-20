import { NextResponse } from "next/server";
import {
  clearManagerSession,
  setManagerSession,
  validateCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!validateCredentials(body.username ?? "", body.password ?? "")) {
    return NextResponse.json(
      { error: "Usuário ou senha inválidos" },
      { status: 401 },
    );
  }

  await setManagerSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearManagerSession();
  return NextResponse.json({ ok: true });
}

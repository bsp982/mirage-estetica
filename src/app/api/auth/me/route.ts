import { NextResponse } from "next/server";
import { isManagerAuthenticated } from "@/lib/auth";

export async function GET() {
  const authenticated = await isManagerAuthenticated();
  return NextResponse.json({ authenticated });
}

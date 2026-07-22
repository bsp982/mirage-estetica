import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const settings = await prisma.companySettings.findUnique({
    where: { companyId: session.companyId },
  });
  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
  });

  return NextResponse.json({ settings, company });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const settings = await prisma.companySettings.upsert({
    where: { companyId: session.companyId },
    create: {
      companyId: session.companyId,
      ...body,
    },
    update: body,
  });

  return NextResponse.json({ settings });
}

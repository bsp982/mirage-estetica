import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertFeature } from "@/lib/features";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const domains = await prisma.companyDomain.findMany({
    where: { companyId: session.companyId },
  });

  return NextResponse.json({ domains });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await assertFeature(session.companyId, "CUSTOM_DOMAIN");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Domínio próprio indisponível" },
      { status: 403 },
    );
  }

  const body = (await request.json()) as { domain: string };
  const domain = body.domain.trim().toLowerCase();

  const created = await prisma.companyDomain.create({
    data: {
      companyId: session.companyId,
      domain,
      active: true,
      verified: false,
    },
  });

  return NextResponse.json({ domain: created }, { status: 201 });
}

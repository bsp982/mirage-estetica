import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertFeature } from "@/lib/features";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    where: { companyId: session.companyId },
    include: { packages: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    await assertFeature(session.companyId, "SERVICES");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Plano sem serviços" },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    slug: string;
    name: string;
    tagline?: string;
    description: string;
    durationHours: number;
    priceFrom: number;
    category?: string;
    active?: boolean;
  };

  const service = await prisma.service.create({
    data: {
      companyId: session.companyId,
      slug: body.slug.trim(),
      name: body.name.trim(),
      tagline: body.tagline?.trim() || null,
      description: body.description.trim(),
      durationHours: Number(body.durationHours),
      priceFrom: Number(body.priceFrom),
      category: body.category?.trim() || null,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: string;
    name?: string;
    description?: string;
    durationHours?: number;
    priceFrom?: number;
    category?: string | null;
    active?: boolean;
    tagline?: string | null;
  };

  const existing = await prisma.service.findFirst({
    where: { id: body.id, companyId: session.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  }

  const service = await prisma.service.update({
    where: { id: body.id },
    data: {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      durationHours: body.durationHours ?? existing.durationHours,
      priceFrom: body.priceFrom ?? existing.priceFrom,
      category: body.category !== undefined ? body.category : existing.category,
      active: body.active ?? existing.active,
      tagline: body.tagline !== undefined ? body.tagline : existing.tagline,
    },
  });

  return NextResponse.json({ service });
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { vehicleDisplayName } from "@/lib/phone";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const customerId = new URL(request.url).searchParams.get("customerId");

  const vehicles = await prisma.vehicle.findMany({
    where: {
      companyId: session.companyId,
      ...(customerId ? { customerId } : {}),
    },
    include: { customer: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    vehicles: vehicles.map((v) => ({
      ...v,
      label: vehicleDisplayName(v),
      customerName: v.customer.name,
    })),
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: string;
    brand?: string;
    model?: string;
    year?: number | null;
    color?: string | null;
    plate?: string | null;
    notes?: string | null;
  };

  const existing = await prisma.vehicle.findFirst({
    where: { id: body.id, companyId: session.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: body.id },
    data: {
      brand: body.brand ?? existing.brand,
      model: body.model ?? existing.model,
      year: body.year !== undefined ? body.year : existing.year,
      color: body.color !== undefined ? body.color : existing.color,
      plate: body.plate !== undefined ? body.plate : existing.plate,
      notes: body.notes !== undefined ? body.notes : existing.notes,
    },
  });

  return NextResponse.json({ vehicle });
}

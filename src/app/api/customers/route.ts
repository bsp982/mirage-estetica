import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCustomerCreditBalance } from "@/lib/referrals";
import { vehicleDisplayName } from "@/lib/phone";

/** Clientes são criados pelo agendamento — aqui o gestor só consulta/edita. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      companyId: session.companyId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q.replace(/\D/g, "") } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      vehicles: true,
      _count: { select: { appointments: true } },
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  const withCredits = await Promise.all(
    customers.map(async (c) => ({
      ...c,
      creditBalance: await getCustomerCreditBalance(session.companyId, c.id),
      vehicles: c.vehicles.map((v) => ({
        ...v,
        label: vehicleDisplayName(v),
      })),
    })),
  );

  return NextResponse.json({ customers: withCredits });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: string;
    name?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
    birthDate?: string | null;
    document?: string | null;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const existing = await prisma.customer.findFirst({
    where: { id: body.id, companyId: session.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const customer = await prisma.customer.update({
    where: { id: body.id },
    data: {
      name: body.name?.trim() ?? existing.name,
      email: body.email !== undefined ? body.email?.trim() || null : existing.email,
      whatsapp:
        body.whatsapp !== undefined
          ? body.whatsapp?.replace(/\D/g, "") || null
          : existing.whatsapp,
      address: body.address !== undefined ? body.address : existing.address,
      document: body.document !== undefined ? body.document : existing.document,
      birthDate:
        body.birthDate === null
          ? null
          : body.birthDate
            ? new Date(body.birthDate)
            : existing.birthDate,
    },
  });

  return NextResponse.json({ customer });
}

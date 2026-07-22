import { NextResponse } from "next/server";
import { createAppointment } from "@/lib/storage";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { vehicleDisplayName } from "@/lib/phone";
import type { CreateAppointmentInput } from "@/lib/types";
import { getDefaultCompany } from "@/lib/tenant";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { companyId: session.companyId },
    include: {
      customer: true,
      vehicle: true,
      service: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const enriched = appointments.map((a) => {
    let packageIds: string[] = [];
    try {
      packageIds = JSON.parse(a.packageIdsJson) as string[];
    } catch {
      packageIds = [];
    }
    return {
      id: a.id,
      serviceId: a.serviceId,
      serviceName: a.service.name,
      packageIds,
      date: a.date,
      time: a.time,
      status: a.status,
      price: a.price,
      customerName: a.customer.name,
      customerPhone: a.customer.phone,
      customerId: a.customerId,
      customerCar: a.vehicle ? vehicleDisplayName(a.vehicle) : "",
      vehicleId: a.vehicleId,
      notes: a.notes ?? "",
      createdAt: a.createdAt.toISOString(),
      scheduledAt: a.scheduledAt.toISOString(),
      estimatedEndAt: a.estimatedEndAt.toISOString(),
    };
  });

  return NextResponse.json({ appointments: enriched });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAppointmentInput & {
      companyId?: string;
    };
    const session = await getSession();
    const companyId =
      body.companyId ??
      session?.companyId ??
      (await getDefaultCompany()).id;

    const appointment = await createAppointment(body, companyId);
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível agendar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

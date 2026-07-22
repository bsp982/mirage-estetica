import { NextResponse } from "next/server";
import { listAppointmentsForSlots } from "@/lib/storage";
import { getAvailableSlotsWithDurations, isWeekendClosed } from "@/lib/slots";
import { getServiceById } from "@/lib/services";
import { getDefaultCompany } from "@/lib/tenant";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  const serviceId = searchParams.get("serviceId") ?? "";
  const companyIdParam = searchParams.get("companyId");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  let companyId = companyIdParam;
  if (!companyId && serviceId) {
    const svc = await prisma.service.findFirst({
      where: { OR: [{ id: serviceId }, { slug: serviceId }] },
      select: { companyId: true },
    });
    companyId = svc?.companyId ?? null;
  }
  if (!companyId) {
    companyId = (await getDefaultCompany()).id;
  }

  const service = await getServiceById(serviceId, companyId);
  if (!service) {
    return NextResponse.json({ error: "Serviço inválido" }, { status: 400 });
  }
  if (isWeekendClosed(date)) {
    return NextResponse.json({
      available: [],
      occupied: [],
      closed: true,
      message: "Fechado aos domingos",
    });
  }

  const appointments = await listAppointmentsForSlots(companyId, date);
  const withDuration = await Promise.all(
    appointments.map(async (a) => {
      const svc = await prisma.service.findFirst({
        where: { id: a.serviceId, companyId },
      });
      return { ...a, durationHours: svc?.durationHours ?? 1 };
    }),
  );

  const { available, occupied } = getAvailableSlotsWithDurations(
    withDuration,
    date,
    service,
  );

  return NextResponse.json({ available, occupied, closed: false });
}

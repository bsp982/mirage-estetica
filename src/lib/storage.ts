import { prisma } from "./db";
import { findOrCreateCustomer, findOrCreateVehicle } from "./customers";
import { getServiceById } from "./services";
import { getDefaultCompany } from "./tenant";
import { rangesOverlap, slotToMinutes } from "./slots";
import type { Appointment, AppointmentStatus, CreateAppointmentInput } from "./types";
import { vehicleDisplayName } from "./phone";
import { notifyAppointmentCreated, notifyStatusChange } from "./communication";
import { syncGoogleCalendarForAppointment } from "./google-calendar";
import { processReferralOnFinalize } from "./referrals";
import { awardLoyaltyOnFinalize } from "./loyalty";

function toLegacyAppointment(row: {
  id: string;
  serviceId: string;
  packageIdsJson: string;
  date: string;
  time: string;
  notes: string | null;
  createdAt: Date;
  status: string;
  price: number | null;
  customer: { name: string; phone: string };
  vehicle: {
    brand: string;
    model: string;
    year: number | null;
    color: string | null;
    plate: string | null;
  } | null;
}): Appointment {
  let packageIds: string[] = [];
  try {
    packageIds = JSON.parse(row.packageIdsJson) as string[];
  } catch {
    packageIds = [];
  }
  return {
    id: row.id,
    serviceId: row.serviceId,
    packageIds,
    date: row.date,
    time: row.time,
    customerName: row.customer.name,
    customerPhone: row.customer.phone,
    customerCar: row.vehicle
      ? vehicleDisplayName(row.vehicle)
      : "",
    notes: row.notes ?? "",
    createdAt: row.createdAt.toISOString(),
    status: row.status as AppointmentStatus,
    price: row.price,
  };
}

export async function listAppointments(
  companyId?: string,
): Promise<Appointment[]> {
  const cid = companyId ?? (await getDefaultCompany()).id;
  const rows = await prisma.appointment.findMany({
    where: {
      companyId: cid,
      status: { notIn: ["CANCELADO"] },
    },
    include: { customer: true, vehicle: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return rows.map(toLegacyAppointment);
}

export async function listAppointmentsForSlots(
  companyId: string,
  date: string,
): Promise<Appointment[]> {
  const rows = await prisma.appointment.findMany({
    where: {
      companyId,
      date,
      status: { notIn: ["CANCELADO", "NAO_COMPARECEU"] },
    },
    include: { customer: true, vehicle: true },
  });
  return rows.map(toLegacyAppointment);
}

export async function createAppointment(
  input: CreateAppointmentInput,
  companyId?: string,
): Promise<Appointment> {
  const company = companyId
    ? await prisma.company.findUniqueOrThrow({ where: { id: companyId } })
    : await getDefaultCompany();

  const service = await getServiceById(input.serviceId, company.id);
  if (!service) {
    throw new Error("Serviço inválido");
  }

  const name = input.customerName.trim();
  const phone = input.customerPhone.trim();
  if (!name || !phone) {
    throw new Error("Nome e telefone são obrigatórios");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error("Data inválida");
  }
  if (!/^\d{2}:\d{2}$/.test(input.time)) {
    throw new Error("Horário inválido");
  }

  const validPackageIds = new Set(service.packages.map((p) => p.id));
  const packageIds = input.packageIds.filter((id) => validPackageIds.has(id));
  if (packageIds.length === 0) {
    throw new Error("Selecione ao menos um item do pacote");
  }

  const existing = await listAppointmentsForSlots(company.id, input.date);

  const durationMinutes = service.durationHours * 60;
  const start = slotToMinutes(input.time);
  const end = start + durationMinutes;

  for (const a of existing) {
    const other = await getServiceById(a.serviceId, company.id);
    const otherEnd = slotToMinutes(a.time) + (other?.durationHours ?? 1) * 60;
    if (
      rangesOverlap(
        { start, end },
        { start: slotToMinutes(a.time), end: otherEnd },
      )
    ) {
      throw new Error("Horário indisponível. Escolha outro horário.");
    }
  }

  const customer = await findOrCreateCustomer({
    companyId: company.id,
    name,
    phone,
  });

  const vehicle = await findOrCreateVehicle({
    companyId: company.id,
    customerId: customer.id,
    customerCar: input.customerCar,
  });

  const scheduledAt = new Date(`${input.date}T${input.time}:00`);
  const estimatedEndAt = new Date(
    scheduledAt.getTime() + durationMinutes * 60_000,
  );

  const dbService = await prisma.service.findFirstOrThrow({
    where: {
      companyId: company.id,
      OR: [{ id: input.serviceId }, { slug: input.serviceId }],
    },
  });

  const created = await prisma.appointment.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      vehicleId: vehicle?.id,
      serviceId: dbService.id,
      packageIdsJson: JSON.stringify(packageIds),
      date: input.date,
      time: input.time,
      scheduledAt,
      estimatedEndAt,
      status: "AGENDADO",
      price: dbService.priceFrom,
      notes: (input.notes ?? "").trim(),
    },
    include: { customer: true, vehicle: true },
  });

  // Indicação opcional (código = telefone do indicador ou id)
  if (input.referralCode?.trim()) {
    const { attachReferralByCode } = await import("./referrals");
    await attachReferralByCode({
      companyId: company.id,
      referredCustomerId: customer.id,
      code: input.referralCode.trim(),
      serviceId: dbService.id,
      appointmentId: created.id,
    }).catch(() => undefined);
  }

  await notifyAppointmentCreated(created.id).catch(console.error);
  await syncGoogleCalendarForAppointment(created.id, "create").catch(console.error);

  return toLegacyAppointment(created);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  companyId: string,
  status: AppointmentStatus,
) {
  const current = await prisma.appointment.findFirst({
    where: { id: appointmentId, companyId },
  });
  if (!current) throw new Error("Agendamento não encontrado");

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: { customer: true, vehicle: true, service: true },
  });

  if (status === "FINALIZADO") {
    await prisma.financialTransaction.create({
      data: {
        companyId,
        type: "INCOME",
        category: "SERVICO",
        description: `Serviço: ${updated.service.name} — ${updated.customer.name}`,
        amount: updated.price ?? updated.service.priceFrom,
        date: new Date(),
        appointmentId: updated.id,
      },
    });
    await processReferralOnFinalize(updated.id).catch(console.error);
    await awardLoyaltyOnFinalize(updated.id).catch(console.error);
  }

  await notifyStatusChange(updated.id, status).catch(console.error);
  await syncGoogleCalendarForAppointment(
    updated.id,
    status === "CANCELADO" ? "cancel" : "update",
  ).catch(console.error);

  return updated;
}

export async function rescheduleAppointment(input: {
  appointmentId: string;
  companyId: string;
  date: string;
  time: string;
}) {
  const current = await prisma.appointment.findFirst({
    where: { id: input.appointmentId, companyId: input.companyId },
    include: { service: true },
  });
  if (!current) throw new Error("Agendamento não encontrado");

  const durationMinutes = current.service.durationHours * 60;
  const scheduledAt = new Date(`${input.date}T${input.time}:00`);
  const estimatedEndAt = new Date(
    scheduledAt.getTime() + durationMinutes * 60_000,
  );

  const updated = await prisma.appointment.update({
    where: { id: current.id },
    data: {
      date: input.date,
      time: input.time,
      scheduledAt,
      estimatedEndAt,
    },
    include: { customer: true, vehicle: true },
  });

  await syncGoogleCalendarForAppointment(updated.id, "update").catch(console.error);
  return toLegacyAppointment(updated);
}

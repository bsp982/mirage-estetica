import { promises as fs } from "fs";
import path from "path";
import type { Appointment, CreateAppointmentInput } from "./types";
import { getServiceById } from "./services";
import { getOccupiedRanges, rangesOverlap, slotToMinutes } from "./slots";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

export async function listAppointments(): Promise<Appointment[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as Appointment[];
  return parsed.sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
  );
}

async function saveAppointments(items: Appointment[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const service = getServiceById(input.serviceId);
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

  const existing = await listAppointments();
  const occupied = getOccupiedRanges(existing, input.date);
  const start = slotToMinutes(input.time);
  const end = start + service.durationHours * 60;
  const conflict = occupied.some((range) =>
    rangesOverlap({ start, end }, range),
  );
  if (conflict) {
    throw new Error("Horário indisponível. Escolha outro horário.");
  }

  const appointment: Appointment = {
    id: `apt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    serviceId: service.id,
    packageIds,
    date: input.date,
    time: input.time,
    customerName: name,
    customerPhone: phone,
    customerCar: input.customerCar.trim(),
    notes: (input.notes ?? "").trim(),
    createdAt: new Date().toISOString(),
  };

  existing.push(appointment);
  await saveAppointments(existing);
  return appointment;
}

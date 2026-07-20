import type { Appointment } from "./types";
import { BASE_SLOTS, getServiceById } from "./services";

export type TimeRange = { start: number; end: number };

export function slotToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToSlot(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function getOccupiedRanges(
  appointments: Appointment[],
  date: string,
): TimeRange[] {
  return appointments
    .filter((a) => a.date === date)
    .map((a) => {
      const service = getServiceById(a.serviceId);
      const hours = service?.durationHours ?? 1;
      const start = slotToMinutes(a.time);
      return { start, end: start + hours * 60 };
    });
}

/** Horários iniciais disponíveis para um serviço (sem expor nomes de clientes). */
export function getAvailableSlots(
  appointments: Appointment[],
  date: string,
  serviceId: string,
): { available: string[]; occupied: string[] } {
  const service = getServiceById(serviceId);
  if (!service) {
    return { available: [], occupied: [] };
  }

  const duration = service.durationHours * 60;
  const occupiedRanges = getOccupiedRanges(appointments, date);
  const dayEnd = slotToMinutes("18:00");

  const available: string[] = [];
  const occupied: string[] = [];

  for (const slot of BASE_SLOTS) {
    const start = slotToMinutes(slot);
    const end = start + duration;
    if (end > dayEnd) {
      continue;
    }
    const blocked = occupiedRanges.some((range) =>
      rangesOverlap({ start, end }, range),
    );
    if (blocked) {
      occupied.push(slot);
    } else {
      available.push(slot);
    }
  }

  return { available, occupied };
}

export function isWeekendClosed(date: string): boolean {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day === 0;
}

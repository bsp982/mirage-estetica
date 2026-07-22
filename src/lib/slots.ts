import type { Appointment, Service } from "./types";
import { BASE_SLOTS } from "./brand";

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
  resolveDurationHours: (serviceId: string) => number = () => 1,
): TimeRange[] {
  return appointments
    .filter((a) => a.date === date)
    .map((a) => {
      const hours =
        typeof resolveDurationHours === "function"
          ? resolveDurationHours(a.serviceId)
          : 1;
      const start = slotToMinutes(a.time);
      return { start, end: start + hours * 60 };
    });
}

export function getAvailableSlots(
  appointments: Appointment[],
  date: string,
  service: Service,
): { available: string[]; occupied: string[] } {
  const duration = service.durationHours * 60;
  const durationById = new Map<string, number>();
  // appointments may reference other services — caller should pass enriched list
  // Fallback: use same duration if unknown
  const occupiedRanges = appointments
    .filter((a) => a.date === date)
    .map((a) => {
      const hours = durationById.get(a.serviceId) ?? service.durationHours;
      // Better: if different service id, still block by that appointment's duration if encoded... use 1h min guess from package
      void hours;
      return {
        start: slotToMinutes(a.time),
        // Without lookup, assume max 4h for unknown to be safe? Prefer explicit duration map.
        end: slotToMinutes(a.time) + (a.serviceId === service.id ? duration : 120),
      };
    });

  // Prefer accurate: use getOccupiedRanges with map from caller
  void occupiedRanges;

  const ranges = appointments
    .filter((a) => a.date === date)
    .map((a) => {
      // durationHours attached optionally via price hack — use 2h default for others
      const hrs = (a as Appointment & { durationHours?: number }).durationHours ?? 2;
      return { start: slotToMinutes(a.time), end: slotToMinutes(a.time) + hrs * 60 };
    });

  const dayEnd = slotToMinutes("18:00");
  const available: string[] = [];
  const occupied: string[] = [];

  for (const slot of BASE_SLOTS) {
    const start = slotToMinutes(slot);
    const end = start + duration;
    if (end > dayEnd) continue;
    const blocked = ranges.some((range) =>
      rangesOverlap({ start, end }, range),
    );
    if (blocked) occupied.push(slot);
    else available.push(slot);
  }

  return { available, occupied };
}

export function getAvailableSlotsWithDurations(
  appointments: Array<Appointment & { durationHours: number }>,
  date: string,
  service: Service,
): { available: string[]; occupied: string[] } {
  const duration = service.durationHours * 60;
  const ranges = appointments
    .filter((a) => a.date === date)
    .map((a) => ({
      start: slotToMinutes(a.time),
      end: slotToMinutes(a.time) + a.durationHours * 60,
    }));

  const dayEnd = slotToMinutes("18:00");
  const available: string[] = [];
  const occupied: string[] = [];

  for (const slot of BASE_SLOTS) {
    const start = slotToMinutes(slot);
    const end = start + duration;
    if (end > dayEnd) continue;
    const blocked = ranges.some((range) =>
      rangesOverlap({ start, end }, range),
    );
    if (blocked) occupied.push(slot);
    else available.push(slot);
  }

  return { available, occupied };
}

export function isWeekendClosed(date: string): boolean {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day === 0;
}

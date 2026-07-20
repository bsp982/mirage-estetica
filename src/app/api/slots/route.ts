import { NextResponse } from "next/server";
import { listAppointments } from "@/lib/storage";
import { getAvailableSlots, isWeekendClosed } from "@/lib/slots";
import { getServiceById } from "@/lib/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  const serviceId = searchParams.get("serviceId") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }
  if (!getServiceById(serviceId)) {
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

  const appointments = await listAppointments();
  const { available, occupied } = getAvailableSlots(
    appointments,
    date,
    serviceId,
  );

  // Cliente só recebe horários — sem nomes ou dados de outros clientes
  return NextResponse.json({ available, occupied, closed: false });
}

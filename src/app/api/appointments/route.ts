import { NextResponse } from "next/server";
import { createAppointment, listAppointments } from "@/lib/storage";
import { isManagerAuthenticated } from "@/lib/auth";
import { getServiceById } from "@/lib/services";
import type { CreateAppointmentInput } from "@/lib/types";

export async function GET() {
  const authed = await isManagerAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const appointments = await listAppointments();
  const enriched = appointments.map((a) => ({
    ...a,
    serviceName: getServiceById(a.serviceId)?.name ?? a.serviceId,
  }));

  return NextResponse.json({ appointments: enriched });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAppointmentInput;
    const appointment = await createAppointment(body);
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível agendar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

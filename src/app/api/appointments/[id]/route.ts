import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  rescheduleAppointment,
  updateAppointmentStatus,
} from "@/lib/storage";
import type { AppointmentStatus } from "@/lib/types";
import { APPOINTMENT_STATUSES } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await request.json()) as {
    status?: string;
    date?: string;
    time?: string;
  };

  try {
    if (body.status) {
      if (!APPOINTMENT_STATUSES.includes(body.status as AppointmentStatus)) {
        return NextResponse.json({ error: "Status inválido" }, { status: 400 });
      }
      const updated = await updateAppointmentStatus(
        id,
        session.companyId,
        body.status as AppointmentStatus,
      );
      return NextResponse.json({ appointment: updated });
    }

    if (body.date && body.time) {
      const updated = await rescheduleAppointment({
        appointmentId: id,
        companyId: session.companyId,
        date: body.date,
        time: body.time,
      });
      return NextResponse.json({ appointment: updated });
    }

    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao atualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

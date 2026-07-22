import { prisma } from "./db";
import { hasFeature } from "./features";

/**
 * Integração Google Calendar (Fase 3).
 * Sem credenciais: grava evento mock em google_calendar_event para o fluxo funcionar.
 */
export async function syncGoogleCalendarForAppointment(
  appointmentId: string,
  action: "create" | "update" | "cancel",
) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      customer: true,
      service: true,
      vehicle: true,
      googleEvent: true,
    },
  });
  if (!apt) return;
  if (!(await hasFeature(apt.companyId, "GOOGLE_CALENDAR"))) return;

  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  if (action === "cancel") {
    if (apt.googleEvent) {
      await prisma.googleCalendarEvent.delete({
        where: { id: apt.googleEvent.id },
      });
    }
    return;
  }

  const googleEventId =
    apt.googleEvent?.googleEventId ??
    `local_${apt.id}_${Date.now().toString(36)}`;

  // Com GOOGLE_SERVICE_ACCOUNT_JSON: chamar Google Calendar API aqui.
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.info(
      "[google-calendar]",
      action,
      apt.customer.name,
      apt.service.name,
      apt.scheduledAt.toISOString(),
    );
  }

  await prisma.googleCalendarEvent.upsert({
    where: { appointmentId: apt.id },
    create: {
      appointmentId: apt.id,
      companyId: apt.companyId,
      googleEventId,
      calendarId,
    },
    update: {
      googleEventId,
      calendarId,
    },
  });
}

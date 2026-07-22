import { prisma } from "./db";
import { hasFeature } from "./features";
import { sendEmail } from "./email";
import { gestorLoginUrl, tenantSiteUrl } from "./app-url";
import type { AppointmentStatus } from "./types";

type Channel = "EMAIL" | "WHATSAPP" | "LOG";

async function deliver(input: {
  companyId: string;
  appointmentId?: string;
  customerId?: string;
  channel: Channel;
  template: string;
  recipient: string;
  subject?: string;
  body: string;
  html?: string;
}) {
  let status = "LOGGED";

  if (input.channel === "EMAIL") {
    const result = await sendEmail({
      to: input.recipient,
      subject: input.subject || "Estética CRM",
      text: input.body,
      html: input.html || `<pre style="font-family:sans-serif">${input.body}</pre>`,
    });
    status = result.ok ? "SENT" : `FAILED:${result.reason}`;
  }

  if (input.channel === "WHATSAPP" && process.env.WHATSAPP_API_TOKEN) {
    status = "QUEUED_WHATSAPP";
    console.info("[whatsapp]", input.recipient, input.body.slice(0, 120));
  }

  if (input.channel === "LOG") {
    console.info(
      "[communication]",
      input.template,
      input.recipient,
      input.body.slice(0, 160),
    );
  }

  await prisma.communicationLog.create({
    data: {
      companyId: input.companyId,
      appointmentId: input.appointmentId,
      customerId: input.customerId,
      channel: input.channel,
      template: input.template,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      status,
    },
  });

  return status;
}

/** E-mail de boas-vindas após cadastro FREE/onboarding. */
export async function sendOnboardingWelcomeEmail(input: {
  companyId: string;
  companyName: string;
  slug: string;
  adminName: string;
  adminEmail: string;
}): Promise<{ sent: boolean; status: string }> {
  const siteUrl = tenantSiteUrl(input.slug);
  const gestorUrl = gestorLoginUrl();

  const subject = `${input.companyName} está no ar — seus links Estética CRM`;
  const text = [
    `Olá, ${input.adminName}!`,
    "",
    `Sua estética "${input.companyName}" foi criada com sucesso no plano FREE.`,
    "",
    "Envie este link aos seus clientes para agendar:",
    siteUrl,
    "",
    "Acesse o painel do gestor para acompanhar a agenda:",
    gestorUrl,
    "",
    `Login: ${input.adminEmail}`,
    "",
    "Bom atendimento!",
    "Equipe Estética CRM",
  ].join("\n");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;line-height:1.5">
    <h1 style="font-size:22px;margin:0 0 12px">Olá, ${escapeHtml(input.adminName)}!</h1>
    <p style="margin:0 0 16px">
      Sua estética <strong>${escapeHtml(input.companyName)}</strong> foi criada com sucesso no plano FREE.
    </p>
    <div style="border:1px solid #e5e5e5;border-radius:12px;padding:16px;margin:0 0 16px;background:#fafafa">
      <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#666">
        Site para seus clientes agendarem
      </p>
      <p style="margin:0 0 12px">
        <a href="${siteUrl}" style="color:#0b2a8f;font-weight:600">${siteUrl}</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#666">
        Painel do gestor (acompanhar agenda)
      </p>
      <p style="margin:0">
        <a href="${gestorUrl}" style="color:#0b2a8f;font-weight:600">${gestorUrl}</a>
      </p>
    </div>
    <p style="margin:0 0 8px">Login: <strong>${escapeHtml(input.adminEmail)}</strong></p>
    <p style="margin:0;color:#666;font-size:14px">Bom atendimento!<br/>Equipe Estética CRM</p>
  </div>`;

  const status = await deliver({
    companyId: input.companyId,
    channel: "EMAIL",
    template: "ONBOARDING_WELCOME",
    recipient: input.adminEmail,
    subject,
    body: text,
    html,
  });

  return { sent: status === "SENT", status };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function notifyAppointmentCreated(appointmentId: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { customer: true, service: true, company: { include: { settings: true } } },
  });
  if (!apt) return;

  const body = `Olá, ${apt.customer.name}! Seu agendamento de ${apt.service.name} está confirmado para ${apt.date} às ${apt.time}.`;

  if (await hasFeature(apt.companyId, "EMAIL")) {
    await deliver({
      companyId: apt.companyId,
      appointmentId: apt.id,
      customerId: apt.customerId,
      channel: "EMAIL",
      template: "APPOINTMENT_CONFIRMATION",
      recipient: apt.customer.email || apt.customer.phone,
      subject: "Confirmação de agendamento",
      body,
    });
  } else {
    await deliver({
      companyId: apt.companyId,
      appointmentId: apt.id,
      customerId: apt.customerId,
      channel: "LOG",
      template: "APPOINTMENT_CONFIRMATION",
      recipient: apt.customer.phone,
      subject: "Confirmação de agendamento",
      body,
    });
  }

  if (await hasFeature(apt.companyId, "WHATSAPP")) {
    await deliver({
      companyId: apt.companyId,
      appointmentId: apt.id,
      customerId: apt.customerId,
      channel: "WHATSAPP",
      template: "APPOINTMENT_CONFIRMATION",
      recipient: apt.customer.whatsapp || apt.customer.phone,
      body,
    });
  }
}

export async function notifyStatusChange(
  appointmentId: string,
  status: AppointmentStatus,
) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { customer: true, service: true },
  });
  if (!apt) return;

  const messages: Partial<Record<AppointmentStatus, string>> = {
    EM_EXECUCAO: `Olá, ${apt.customer.name}! O serviço ${apt.service.name} foi iniciado.`,
    AGUARDANDO_RETIRADA: `Olá, ${apt.customer.name}! Seu veículo está pronto para retirada.`,
    FINALIZADO: `Olá, ${apt.customer.name}! Obrigado por confiar em nós. Avalie nosso atendimento e, quando precisar, estaremos à disposição.`,
  };

  const body = messages[status];
  if (!body) return;

  await deliver({
    companyId: apt.companyId,
    appointmentId: apt.id,
    customerId: apt.customerId,
    channel: "LOG",
    template: `STATUS_${status}`,
    recipient: apt.customer.email || apt.customer.phone,
    subject: `Atualização: ${status}`,
    body,
  });
}

/** Job: 30 minutos antes do término estimado. */
export async function sendPickupSoonNotifications(now = new Date()) {
  const windowStart = new Date(now.getTime() + 29 * 60_000);
  const windowEnd = new Date(now.getTime() + 31 * 60_000);

  const due = await prisma.appointment.findMany({
    where: {
      status: "EM_EXECUCAO",
      estimatedEndAt: { gte: windowStart, lte: windowEnd },
    },
    include: { customer: true, service: true },
  });

  for (const apt of due) {
    const already = await prisma.communicationLog.findFirst({
      where: {
        appointmentId: apt.id,
        template: "PICKUP_SOON_30MIN",
      },
    });
    if (already) continue;

    const endLabel = apt.estimatedEndAt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const body = `Olá, ${apt.customer.name}! Seu veículo está quase pronto. A previsão de finalização do serviço é às ${endLabel}. Você pode se programar para realizar a retirada.`;

    await deliver({
      companyId: apt.companyId,
      appointmentId: apt.id,
      customerId: apt.customerId,
      channel: "LOG",
      template: "PICKUP_SOON_30MIN",
      recipient: apt.customer.whatsapp || apt.customer.phone,
      body,
    });
  }

  return due.length;
}

export async function sendReturnCampaign(daysInactive = 60) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysInactive);

  const customers = await prisma.customer.findMany({
    include: {
      appointments: {
        where: { status: "FINALIZADO" },
        orderBy: { scheduledAt: "desc" },
        take: 1,
      },
    },
  });

  let sent = 0;
  for (const c of customers) {
    const last = c.appointments[0];
    if (!last || last.scheduledAt > cutoff) continue;

    await deliver({
      companyId: c.companyId,
      customerId: c.id,
      channel: "LOG",
      template: "RETURN_CAMPAIGN",
      recipient: c.whatsapp || c.phone,
      body: `Olá, ${c.name}! Já faz algum tempo desde o último cuidado com seu veículo. Que tal agendar um novo serviço?`,
    });
    sent += 1;
  }
  return sent;
}

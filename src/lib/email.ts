import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type SendEmailResult =
  | { ok: true; provider: "resend" | "smtp" }
  | { ok: false; provider: "none"; reason: string };

function fromAddress(): string {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Estética CRM <onboarding@resend.dev>"
  );
}

async function sendWithResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, provider: "none", reason: "RESEND_API_KEY ausente" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[email:resend]", res.status, detail.slice(0, 300));
    let reason = `Resend falhou (${res.status})`;
    try {
      const parsed = JSON.parse(detail) as {
        message?: string;
        name?: string;
      };
      const msg = parsed.message || "";
      if (/testing domain|verify a domain|own email/i.test(msg)) {
        reason =
          "O domínio de teste do Resend só envia para o e-mail da conta. Verifique um domínio próprio e altere o remetente (EMAIL_FROM).";
      } else if (msg) {
        reason = msg;
      }
    } catch {
      // ignore parse errors
    }
    return {
      ok: false,
      provider: "none",
      reason,
    };
  }

  return { ok: true, provider: "resend" };
}

async function sendWithSmtp(input: SendEmailInput): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    return { ok: false, provider: "none", reason: "SMTP_HOST ausente" };
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { ok: true, provider: "smtp" };
}

/** Envia e-mail via Resend (preferencial) ou SMTP. Nunca lança — falha fica no retorno. */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  try {
    if (process.env.RESEND_API_KEY?.trim()) {
      return await sendWithResend(input);
    }
    if (process.env.SMTP_HOST?.trim()) {
      return await sendWithSmtp(input);
    }
    console.info(
      "[email:skipped]",
      input.to,
      input.subject,
      "— configure RESEND_API_KEY ou SMTP_*",
    );
    return {
      ok: false,
      provider: "none",
      reason: "Nenhum provedor de e-mail configurado",
    };
  } catch (error) {
    console.error("[email]", error);
    return {
      ok: false,
      provider: "none",
      reason: error instanceof Error ? error.message : "Falha ao enviar e-mail",
    };
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim(),
  );
}

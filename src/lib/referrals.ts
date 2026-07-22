import { prisma } from "./db";
import { normalizePhone } from "./phone";
import { hasFeature } from "./features";

export async function attachReferralByCode(input: {
  companyId: string;
  referredCustomerId: string;
  code: string;
  serviceId?: string;
  appointmentId?: string;
}) {
  if (!(await hasFeature(input.companyId, "REFERRAL"))) return null;

  const phone = normalizePhone(input.code);
  const referrer = await prisma.customer.findFirst({
    where: {
      companyId: input.companyId,
      OR: [
        { id: input.code },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (!referrer) throw new Error("Código de indicação inválido");
  if (referrer.id === input.referredCustomerId) {
    throw new Error("Não é possível indicar a si mesmo");
  }

  const existing = await prisma.referral.findUnique({
    where: {
      companyId_referredCustomerId: {
        companyId: input.companyId,
        referredCustomerId: input.referredCustomerId,
      },
    },
  });
  if (existing) return existing;

  return prisma.referral.create({
    data: {
      companyId: input.companyId,
      referrerCustomerId: referrer.id,
      referredCustomerId: input.referredCustomerId,
      serviceId: input.serviceId,
      appointmentId: input.appointmentId,
      status: "PENDING",
      referrerReward: 5,
      referredReward: 10,
    },
  });
}

export async function processReferralOnFinalize(appointmentId: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!apt || apt.status !== "FINALIZADO") return;
  if (!(await hasFeature(apt.companyId, "REFERRAL"))) return;

  const referral = await prisma.referral.findFirst({
    where: {
      companyId: apt.companyId,
      referredCustomerId: apt.customerId,
      status: { in: ["PENDING", "QUALIFIED"] },
    },
  });
  if (!referral) return;

  await prisma.$transaction(async (tx) => {
    await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: "REWARDED",
        processedAt: new Date(),
        appointmentId: apt.id,
        serviceId: apt.serviceId,
      },
    });

    await tx.customerCredit.create({
      data: {
        companyId: apt.companyId,
        customerId: referral.referrerCustomerId,
        amount: referral.referrerReward,
        balance: referral.referrerReward,
        reason: "Indicação recompensada",
        referralId: referral.id,
      },
    });

    // Desconto do indicado como crédito negativo consumível (ou cupom)
    await tx.customerCredit.create({
      data: {
        companyId: apt.companyId,
        customerId: referral.referredCustomerId,
        amount: referral.referredReward,
        balance: referral.referredReward,
        reason: "Desconto por indicação",
        referralId: referral.id,
      },
    });
  });
}

export async function getCustomerCreditBalance(
  companyId: string,
  customerId: string,
): Promise<number> {
  const rows = await prisma.customerCredit.findMany({
    where: { companyId, customerId },
  });
  return rows.reduce((sum, r) => sum + r.balance, 0);
}

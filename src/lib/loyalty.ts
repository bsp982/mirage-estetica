import { prisma } from "./db";
import { hasFeature } from "./features";

/** 1 ponto a cada R$ 100; 500 pontos = R$ 50 crédito (Fase 4). */
export async function awardLoyaltyOnFinalize(appointmentId: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true },
  });
  if (!apt || apt.status !== "FINALIZADO") return;
  if (!(await hasFeature(apt.companyId, "LOYALTY"))) return;

  const amount = apt.price ?? apt.service.priceFrom;
  const points = Math.floor(amount / 100);
  if (points <= 0) return;

  await prisma.loyaltyPoint.create({
    data: {
      companyId: apt.companyId,
      customerId: apt.customerId,
      points,
      reason: `Serviço finalizado (${apt.service.name})`,
    },
  });

  const total = await prisma.loyaltyPoint.aggregate({
    where: { companyId: apt.companyId, customerId: apt.customerId },
    _sum: { points: true },
  });

  const sum = total._sum.points ?? 0;
  if (sum >= 500) {
    await prisma.customerCredit.create({
      data: {
        companyId: apt.companyId,
        customerId: apt.customerId,
        amount: 50,
        balance: 50,
        reason: "Resgate fidelidade (500 pontos)",
      },
    });
    await prisma.loyaltyPoint.create({
      data: {
        companyId: apt.companyId,
        customerId: apt.customerId,
        points: -500,
        reason: "Resgate crédito R$ 50",
      },
    });
  }
}

export async function createBirthdayCoupons() {
  const today = new Date();
  const month = today.getUTCMonth();
  const day = today.getUTCDate();

  const customers = await prisma.customer.findMany({
    where: { birthDate: { not: null } },
  });

  let created = 0;
  for (const c of customers) {
    if (!c.birthDate) continue;
    if (
      c.birthDate.getUTCMonth() !== month ||
      c.birthDate.getUTCDate() !== day
    ) {
      continue;
    }

    const code = `ANIV${c.phone.slice(-4)}${today.getFullYear()}`;
    const exists = await prisma.coupon.findUnique({
      where: {
        companyId_code: { companyId: c.companyId, code },
      },
    });
    if (exists) continue;

    await prisma.coupon.create({
      data: {
        companyId: c.companyId,
        customerId: c.id,
        code,
        description: "10% de desconto no aniversário",
        discountPct: 10,
        expiresAt: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    created += 1;
  }
  return created;
}

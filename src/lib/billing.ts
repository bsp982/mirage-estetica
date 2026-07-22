import { prisma } from "./db";
import type { PaidPlanCode } from "./stripe";

export async function getCompanyBillingSummary(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      plan: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
  });

  if (!company) return null;

  const currentPlan =
    company.subscriptions[0]?.plan ?? company.plan ?? null;

  return {
    companyId: company.id,
    companyName: company.name,
    planCode: (currentPlan?.code ?? "FREE") as string,
    planName: currentPlan?.name ?? "FREE",
    subscriptionStatus:
      company.subscriptions[0]?.status ?? company.subscriptionStatus,
    stripeCustomerId: company.stripeCustomerId,
    stripeSubscriptionId: company.subscriptions[0]?.stripeSubscriptionId ?? null,
  };
}

/** Ativa/atualiza plano pago da empresa após pagamento confirmado. */
export async function activatePaidPlan(input: {
  companyId: string;
  planCode: PaidPlanCode;
  status?: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  amountBrl?: number;
}) {
  const plan = await prisma.plan.findUnique({
    where: { code: input.planCode },
  });
  if (!plan) {
    throw new Error(`Plano ${input.planCode} não encontrado`);
  }

  const status = input.status ?? "ACTIVE";

  await prisma.company.update({
    where: { id: input.companyId },
    data: {
      planId: plan.id,
      subscriptionStatus: status,
      ...(input.stripeCustomerId
        ? { stripeCustomerId: input.stripeCustomerId }
        : {}),
    },
  });

  // Encerra assinaturas ativas anteriores da empresa
  await prisma.subscription.updateMany({
    where: {
      companyId: input.companyId,
      status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] },
      ...(input.stripeSubscriptionId
        ? { stripeSubscriptionId: { not: input.stripeSubscriptionId } }
        : {}),
    },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });

  let subscription = input.stripeSubscriptionId
    ? await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: input.stripeSubscriptionId },
      })
    : null;

  if (subscription) {
    subscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: plan.id,
        status,
        stripePriceId: input.stripePriceId ?? subscription.stripePriceId,
        canceledAt: null,
        startedAt: subscription.startedAt ?? new Date(),
      },
    });
  } else {
    subscription = await prisma.subscription.create({
      data: {
        companyId: input.companyId,
        planId: plan.id,
        status,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        stripePriceId: input.stripePriceId ?? null,
      },
    });
  }

  if (input.amountBrl && input.amountBrl > 0) {
    await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount: input.amountBrl,
        status: "PAID",
        dueAt: new Date(),
        paidAt: new Date(),
      },
    });
  }

  return subscription;
}

export async function markSubscriptionCanceled(stripeSubscriptionId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });
  if (!sub) return null;

  const free = await prisma.plan.findUnique({ where: { code: "FREE" } });

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "CANCELED", canceledAt: new Date() },
  });

  if (free) {
    await prisma.company.update({
      where: { id: sub.companyId },
      data: {
        planId: free.id,
        subscriptionStatus: "CANCELED",
      },
    });
  }

  return sub;
}

import { prisma } from "./db";

export type FeatureCode =
  | "APPOINTMENT"
  | "AGENDA"
  | "BASIC_CUSTOMER"
  | "BASIC_VEHICLE"
  | "SERVICES"
  | "SITE"
  | "FINANCIAL"
  | "VEHICLE_HISTORY"
  | "WORK_ORDER"
  | "REFERRAL"
  | "WHATSAPP"
  | "EMAIL"
  | "GOOGLE_CALENDAR"
  | "AUTOMATION"
  | "LOYALTY"
  | "CUSTOM_DOMAIN"
  | "MULTI_UNIT";

export async function getCompanyFeatureCodes(
  companyId: string,
): Promise<Set<string>> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      plan: { include: { features: { include: { feature: true } } } },
      subscriptions: {
        where: { status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          plan: { include: { features: { include: { feature: true } } } },
        },
      },
    },
  });

  if (!company) return new Set();

  const plan =
    company.subscriptions[0]?.plan ??
    company.plan ??
    null;

  if (!plan) return new Set();

  // PAST_DUE: recursos pagos bloqueados — mantém só o conjunto FREE
  if (company.subscriptions[0]?.status === "PAST_DUE" || company.subscriptionStatus === "PAST_DUE") {
    const free = await prisma.plan.findUnique({
      where: { code: "FREE" },
      include: { features: { include: { feature: true } } },
    });
    return new Set(free?.features.map((f) => f.feature.code) ?? []);
  }

  return new Set(plan.features.map((f) => f.feature.code));
}

export async function hasFeature(
  companyId: string,
  code: FeatureCode,
): Promise<boolean> {
  const codes = await getCompanyFeatureCodes(companyId);
  return codes.has(code);
}

export async function assertFeature(
  companyId: string,
  code: FeatureCode,
): Promise<void> {
  if (!(await hasFeature(companyId, code))) {
    throw new Error(`Funcionalidade ${code} não disponível no plano atual`);
  }
}

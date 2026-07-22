import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/app-url";
import { activatePaidPlan, getCompanyBillingSummary } from "@/lib/billing";
import { prisma } from "@/lib/db";
import {
  getStripe,
  isBillingDemoMode,
  isStripeConfigured,
  PLAN_CATALOG,
  stripePriceIdForPlan,
  type PaidPlanCode,
} from "@/lib/stripe";

const bodySchema = z.object({
  planCode: z.enum(["PRO", "PREMIUM"]),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const summary = await getCompanyBillingSummary(session.companyId);
  return NextResponse.json({
    ...summary,
    catalog: PLAN_CATALOG,
    billingMode: isStripeConfigured()
      ? "stripe"
      : isBillingDemoMode()
        ? "demo"
        : "unavailable",
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { planCode } = bodySchema.parse(await request.json());
    const summary = await getCompanyBillingSummary(session.companyId);
    if (!summary) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 },
      );
    }

    if (summary.planCode === planCode && summary.subscriptionStatus === "ACTIVE") {
      return NextResponse.json(
        { error: `Você já está no plano ${planCode}.` },
        { status: 400 },
      );
    }

    // Downgrade não via checkout — só upgrade
    const rank: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
    if ((rank[summary.planCode] ?? 0) > (rank[planCode] ?? 0)) {
      return NextResponse.json(
        {
          error:
            "Para reduzir o plano, use o portal de cobrança ou fale conosco.",
        },
        { status: 400 },
      );
    }

    const baseUrl = getAppBaseUrl();
    const successUrl = `${baseUrl}/gestor/plano?success=1&plan=${planCode}`;
    const cancelUrl = `${baseUrl}/gestor/plano?canceled=1`;

    if (isStripeConfigured()) {
      const priceId = stripePriceIdForPlan(planCode as PaidPlanCode);
      if (!priceId) {
        return NextResponse.json(
          {
            error: `Preço Stripe do plano ${planCode} não configurado (STRIPE_PRICE_${planCode}).`,
          },
          { status: 500 },
        );
      }

      const stripe = getStripe();
      const company = await prisma.company.findUnique({
        where: { id: session.companyId },
      });
      if (!company) {
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 },
        );
      }

      let customerId = company.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: session.email,
          name: company.name,
          metadata: {
            companyId: company.id,
            companySlug: company.slug,
          },
        });
        customerId = customer.id;
        await prisma.company.update({
          where: { id: company.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const checkout = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: company.id,
        metadata: {
          companyId: company.id,
          planCode,
        },
        subscription_data: {
          metadata: {
            companyId: company.id,
            planCode,
          },
        },
        allow_promotion_codes: true,
      });

      if (!checkout.url) {
        return NextResponse.json(
          { error: "Não foi possível criar a sessão de pagamento" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        mode: "stripe",
        url: checkout.url,
        sessionId: checkout.id,
      });
    }

    if (isBillingDemoMode()) {
      // Ativação imediata em modo demonstração (sem cartão)
      await activatePaidPlan({
        companyId: session.companyId,
        planCode: planCode as PaidPlanCode,
        status: "ACTIVE",
        amountBrl: PLAN_CATALOG[planCode as PaidPlanCode].amountBrl,
      });

      return NextResponse.json({
        mode: "demo",
        url: `${baseUrl}/gestor/plano?success=1&plan=${planCode}&demo=1`,
      });
    }

    return NextResponse.json(
      {
        error:
          "Pagamentos ainda não configurados. Defina STRIPE_SECRET_KEY ou BILLING_MODE=demo.",
      },
      { status: 503 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 },
      );
    }
    console.error("[billing:checkout]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Falha ao iniciar pagamento",
      },
      { status: 500 },
    );
  }
}

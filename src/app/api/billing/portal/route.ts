import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/** Portal do cliente Stripe (gerenciar cartão / cancelar). */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Portal disponível apenas com Stripe configurado." },
      { status: 503 },
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
  });
  if (!company?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Nenhuma assinatura Stripe vinculada a esta empresa." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${getAppBaseUrl()}/gestor/plano`,
  });

  return NextResponse.json({ url: portal.url });
}

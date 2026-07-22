import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { activatePaidPlan, markSubscriptionCanceled } from "@/lib/billing";
import { getStripe, isStripeConfigured, type PaidPlanCode } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function planCodeFromMeta(
  meta: Stripe.Metadata | null | undefined,
): PaidPlanCode | null {
  const code = meta?.planCode?.toUpperCase();
  if (code === "PRO" || code === "PREMIUM") return code;
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const companyId =
    session.metadata?.companyId || session.client_reference_id || null;
  const planCode = planCodeFromMeta(session.metadata);
  if (!companyId || !planCode) {
    console.warn("[stripe:webhook] checkout sem companyId/planCode", session.id);
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  let priceId: string | null = null;
  if (subscriptionId) {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    priceId = sub.items.data[0]?.price?.id ?? null;
  }

  await activatePaidPlan({
    companyId,
    planCode,
    status: "ACTIVE",
    stripeCustomerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
  });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const companyId = sub.metadata?.companyId;
  const planCode = planCodeFromMeta(sub.metadata);
  if (!companyId) return;

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    trialing: "TRIAL",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "PAST_DUE",
    incomplete: "TRIAL",
    incomplete_expired: "CANCELED",
  };

  const status = statusMap[sub.status] ?? "ACTIVE";

  if (status === "CANCELED") {
    await markSubscriptionCanceled(sub.id);
    return;
  }

  if (!planCode) {
    // Mantém status da assinatura existente
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status },
    });
    await prisma.company.updateMany({
      where: { id: companyId },
      data: { subscriptionStatus: status },
    });
    return;
  }

  await activatePaidPlan({
    companyId,
    planCode,
    status,
    stripeCustomerId:
      typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubscriptionId: sub.id,
    stripePriceId: sub.items.data[0]?.price?.id ?? null,
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe não configurado" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Webhook secret ausente" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error("[stripe:webhook] signature", error);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await markSubscriptionCanceled(
          (event.data.object as Stripe.Subscription).id,
        );
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe:webhook] handler", error);
    return NextResponse.json({ error: "Falha no webhook" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

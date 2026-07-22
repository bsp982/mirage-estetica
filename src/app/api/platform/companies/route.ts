import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

/** Super-admin da plataforma (role PLATFORM) ou onboarding público FREE. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    include: {
      plan: true,
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { customers: true, appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const plans = await prisma.plan.findMany({
    include: { features: { include: { feature: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ companies, plans });
}

const onboardSchema = z.object({
  companyName: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  planCode: z.enum(["FREE", "PRO", "PREMIUM", "ENTERPRISE"]).default("FREE"),
});

export async function POST(request: Request) {
  try {
    const body = onboardSchema.parse(await request.json());

    const exists = await prisma.company.findUnique({
      where: { slug: body.slug },
    });
    if (exists) {
      return NextResponse.json({ error: "Slug já em uso" }, { status: 400 });
    }

    const emailTaken = await prisma.user.findFirst({
      where: { email: body.adminEmail.toLowerCase() },
    });
    if (emailTaken) {
      return NextResponse.json(
        { error: "E-mail já cadastrado. Faça login ou use outro e-mail." },
        { status: 400 },
      );
    }

    const plan = await prisma.plan.findUnique({
      where: { code: body.planCode },
    });
    if (!plan) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.adminPassword);
    const phoneDigits = (body.phone ?? "").replace(/\D/g, "") || null;
    const whatsappDigits =
      (body.whatsapp ?? body.phone ?? "").replace(/\D/g, "") || null;

    const company = await prisma.company.create({
      data: {
        name: body.companyName.trim(),
        slug: body.slug,
        planId: plan.id,
        subscriptionStatus: "ACTIVE",
        settings: {
          create: {
            motto: "Seu carro foi feito para brilhar",
            description: `${body.companyName.trim()} — estética automotiva`,
            primaryColor: "#0b2a8f",
            secondaryColor: "#e0b12a",
            heroImageUrl: "/hero/hero-main.jpg",
            hoursLabel: "Seg a Sáb · 08h às 18h",
            phone: phoneDigits,
            whatsapp: whatsappDigits,
          },
        },
        users: {
          create: {
            email: body.adminEmail.toLowerCase(),
            name: body.adminName.trim(),
            passwordHash,
            role: "MANAGER",
          },
        },
        subscriptions: {
          create: {
            planId: plan.id,
            status: body.planCode === "FREE" ? "ACTIVE" : "TRIAL",
            trialEndsAt:
              body.planCode === "FREE"
                ? null
                : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
        // Serviço inicial para o FREE já receber agendamentos
        services: {
          create: {
            slug: "lavagem-detalhada",
            name: "Lavagem Detalhada",
            tagline: "Limpeza técnica de dentro pra fora",
            description:
              "Protocolo de lavagem profissional. Edite este serviço no painel.",
            durationHours: 2,
            priceFrom: 120,
            category: "Lavagem",
            sortOrder: 0,
            packages: {
              create: [
                {
                  slug: "lav-ext",
                  name: "Externa premium",
                  description: "Pré-lavagem, shampoo e secagem",
                  included: true,
                  sortOrder: 0,
                },
                {
                  slug: "lav-int",
                  name: "Interna completa",
                  description: "Aspiração e painéis",
                  included: true,
                  sortOrder: 1,
                },
              ],
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        company: { id: company.id, slug: company.slug, name: company.name },
        sitePath: `/s/${company.slug}`,
        loginPath: "/gestor/login",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Falha ao criar empresa";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

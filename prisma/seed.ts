import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Defina DATABASE_URL (e preferencialmente DIRECT_URL) no .env");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const FEATURES = [
  { code: "APPOINTMENT", description: "Agendamento online" },
  { code: "AGENDA", description: "Agenda do gestor" },
  { code: "BASIC_CUSTOMER", description: "Clientes básicos" },
  { code: "BASIC_VEHICLE", description: "Veículos básicos" },
  { code: "SERVICES", description: "Cadastro de serviços" },
  { code: "SITE", description: "Site público" },
  { code: "FINANCIAL", description: "Financeiro" },
  { code: "VEHICLE_HISTORY", description: "Histórico de veículos" },
  { code: "WORK_ORDER", description: "Ordem de serviço" },
  { code: "REFERRAL", description: "Programa de indicação" },
  { code: "WHATSAPP", description: "WhatsApp" },
  { code: "EMAIL", description: "E-mails automáticos" },
  { code: "GOOGLE_CALENDAR", description: "Google Agenda" },
  { code: "AUTOMATION", description: "Automações" },
  { code: "LOYALTY", description: "Fidelidade" },
  { code: "CUSTOM_DOMAIN", description: "Domínio próprio" },
  { code: "MULTI_UNIT", description: "Multiunidades" },
] as const;

const SERVICES_SEED = [
  {
    slug: "lavagem-detalhada",
    name: "Lavagem Detalhada",
    tagline: "Limpeza técnica de dentro pra fora",
    description:
      "Protocolo de lavagem profissional com atenção a detalhes que o lava-rápido comum não alcança.",
    durationHours: 2,
    priceFrom: 120,
    category: "Lavagem",
    packages: [
      { slug: "lav-ext", name: "Externa premium", description: "Pré-lavagem, shampoo neutro, secagem e pneus", included: true },
      { slug: "lav-int", name: "Interna completa", description: "Aspiração, painéis, vidros internos e portes", included: true },
      { slug: "lav-motor", name: "Compartimento do motor", description: "Limpeza e proteção do bay do motor", included: false },
      { slug: "lav-cera", name: "Cera de proteção", description: "Camada de brilho e proteção rápida", included: false },
    ],
  },
  {
    slug: "higienizacao",
    name: "Higienização Interna",
    tagline: "Conforto e cheiro de carro novo",
    description: "Remoção profunda de sujeira, óleos e odores em bancos, carpetes e teto.",
    durationHours: 3,
    priceFrom: 280,
    category: "Higienização",
    packages: [
      { slug: "hig-bancos", name: "Bancos e laterais", description: "Extração e limpeza de tecidos ou couro", included: true },
      { slug: "hig-carpetes", name: "Carpetes e assoalho", description: "Lavagem com extratora e secagem controlada", included: true },
      { slug: "hig-teto", name: "Teto e colunas", description: "Limpeza delicada do forro interno", included: true },
      { slug: "hig-ozonio", name: "Ozônio / antiodor", description: "Neutralização de odores persistentes", included: false },
    ],
  },
  {
    slug: "polimento-vitrificacao",
    name: "Polimento & Vitrificação",
    tagline: "Brilho espelhado e proteção real",
    description: "Correção de pintura e proteção cerâmica para valorizar o visual e preservar a lataria.",
    durationHours: 4,
    priceFrom: 650,
    category: "Polimento",
    packages: [
      { slug: "pol-correcao", name: "Correção de pintura", description: "Remoção de swirls e opacidade", included: true },
      { slug: "pol-vitri", name: "Vitrificação / cerâmica", description: "Proteção de longa duração e brilho intenso", included: true },
      { slug: "pol-plasticos", name: "Plásticos externos", description: "Revitalização de frisos e para-choques", included: false },
      { slug: "pol-vidros", name: "Tratamento de vidros", description: "Repelência e clareza nos vidros", included: false },
    ],
  },
  {
    slug: "insulfilm",
    name: "Insulfilm Window Blue",
    tagline: "Conforto térmico com garantia",
    description: "Películas profissionais para reduzir calor, proteger a pele e elevar o visual do veículo.",
    durationHours: 3,
    priceFrom: 890,
    category: "Insulfilm",
    packages: [
      { slug: "ins-laterais", name: "Laterais + vigia", description: "Aplicação nas janelas laterais e traseira", included: true },
      { slug: "ins-parabrisas", name: "Para-brisa", description: "Filme no para-brisa com certificado", included: false },
      { slug: "ins-teto", name: "Teto solar", description: "Proteção e conforto no teto", included: false },
      { slug: "ins-garantia", name: "Certificado de garantia", description: "Documentação oficial do serviço", included: true },
    ],
  },
];

async function main() {
  await prisma.communicationLog.deleteMany();
  await prisma.googleCalendarEvent.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.servicePackage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customerCredit.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.companyDomain.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.companySettings.deleteMany();
  await prisma.company.deleteMany();
  await prisma.planFeature.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.plan.deleteMany();

  for (const f of FEATURES) {
    await prisma.feature.create({ data: f });
  }

  const allFeatures = await prisma.feature.findMany();
  const byCode = Object.fromEntries(allFeatures.map((f) => [f.code, f.id]));

  const freeCodes = ["APPOINTMENT", "AGENDA", "BASIC_CUSTOMER", "BASIC_VEHICLE", "SERVICES", "SITE"];
  const proCodes = [...freeCodes, "FINANCIAL", "VEHICLE_HISTORY", "WORK_ORDER"];
  const premiumCodes = [...proCodes, "REFERRAL", "WHATSAPP", "EMAIL", "GOOGLE_CALENDAR", "AUTOMATION", "LOYALTY"];
  const enterpriseCodes = [...premiumCodes, "CUSTOM_DOMAIN", "MULTI_UNIT"];

  async function createPlan(
    code: string,
    name: string,
    price: number,
    sortOrder: number,
    codes: string[],
  ) {
    const plan = await prisma.plan.create({
      data: { code, name, price, sortOrder, billingPeriod: "MONTHLY" },
    });
    for (const c of codes) {
      await prisma.planFeature.create({
        data: { planId: plan.id, featureId: byCode[c] },
      });
    }
    return plan;
  }

  const free = await createPlan("FREE", "Free", 0, 1, freeCodes);
  const pro = await createPlan("PRO", "Pro", 97, 2, proCodes);
  await createPlan("PREMIUM", "Premium", 197, 3, premiumCodes);
  await createPlan("ENTERPRISE", "Enterprise", 497, 4, enterpriseCodes);

  const passwordHash = await bcrypt.hash("admin", 10);

  const company = await prisma.company.create({
    data: {
      name: "Estética MVP",
      slug: "estetica-mvp",
      planId: free.id,
      subscriptionStatus: "ACTIVE",
      settings: {
        create: {
          motto: "Seu carro foi feito para brilhar",
          description: "Estética automotiva de demonstração",
          about:
            "Espaço dedicado a lavagem detalhada, higienização, polimento e películas.",
          address: "Atendimento apenas com agendamento · dados de demonstração",
          phone: "(00) 00000-0000",
          whatsapp: "5500000000000",
          instagram: "https://www.instagram.com/",
          hoursLabel: "Seg a Sáb · 08h às 18h",
          primaryColor: "#0b2a8f",
          secondaryColor: "#e0b12a",
          heroImageUrl: "/hero/hero-main.jpg",
        },
      },
      users: {
        create: {
          email: "admin@estetica.local",
          name: "Gestor Demo",
          passwordHash,
          role: "MANAGER",
        },
      },
      subscriptions: {
        create: {
          planId: free.id,
          status: "ACTIVE",
        },
      },
    },
  });

  // Segunda empresa (demo SaaS / isolamento)
  await prisma.company.create({
    data: {
      name: "Auto Detail Pro",
      slug: "auto-detail-pro",
      planId: pro.id,
      subscriptionStatus: "ACTIVE",
      settings: {
        create: {
          motto: "Detalhe que valoriza",
          primaryColor: "#0f172a",
          secondaryColor: "#f59e0b",
          heroImageUrl: "/hero/hero-shop.jpg",
          hoursLabel: "Seg a Sex · 09h às 18h",
          phone: "(11) 98888-0000",
          whatsapp: "5511988880000",
        },
      },
      users: {
        create: {
          email: "gestor@autodetail.local",
          name: "Gestor Pro",
          passwordHash,
          role: "MANAGER",
        },
      },
      subscriptions: {
        create: { planId: pro.id, status: "ACTIVE" },
      },
      services: {
        create: {
          slug: "lavagem-express",
          name: "Lavagem Express",
          tagline: "Rápido e eficiente",
          description: "Lavagem externa completa em até 1h.",
          durationHours: 1,
          priceFrom: 80,
          category: "Lavagem",
          packages: {
            create: [
              {
                slug: "lex-ext",
                name: "Externa",
                description: "Lavagem externa",
                included: true,
              },
            ],
          },
        },
      },
    },
  });

  for (const [i, s] of SERVICES_SEED.entries()) {
    await prisma.service.create({
      data: {
        companyId: company.id,
        slug: s.slug,
        name: s.name,
        tagline: s.tagline,
        description: s.description,
        durationHours: s.durationHours,
        priceFrom: s.priceFrom,
        category: s.category,
        sortOrder: i,
        packages: {
          create: s.packages.map((p, j) => ({
            slug: p.slug,
            name: p.name,
            description: p.description,
            included: p.included,
            sortOrder: j,
          })),
        },
      },
    });
  }

  const services = await prisma.service.findMany({
    where: { companyId: company.id },
    include: { packages: true },
  });

  await prisma.testimonial.createMany({
    data: [
      {
        companyId: company.id,
        customerName: "Ana Souza",
        rating: 5,
        comment: "Carro saiu impecável. Agendamento pelo site foi rápido.",
      },
      {
        companyId: company.id,
        customerName: "Carlos Lima",
        rating: 5,
        comment: "Polimento ficou com brilho de showroom.",
      },
    ],
  });

  const svc = services[0];
  await prisma.galleryItem.create({
    data: {
      companyId: company.id,
      serviceId: svc.id,
      beforeUrl: "/hero/hero-detail.jpg",
      afterUrl: "/hero/hero-polish.jpg",
      description: "Lavagem detalhada — antes e depois",
      vehicleLabel: "Honda Civic",
      date: new Date(),
    },
  });

  console.log("Seed OK (Supabase/Postgres)");
  console.log("Login: admin@estetica.local / admin");
  console.log("Company slug:", company.slug);
  console.log("2ª empresa (PRO): auto-detail-pro / gestor@autodetail.local / admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

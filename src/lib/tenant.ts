import { prisma } from "./db";

const DEFAULT_SLUG = process.env.DEFAULT_COMPANY_SLUG ?? "estetica-mvp";

export async function getDefaultCompany() {
  const company = await prisma.company.findUnique({
    where: { slug: DEFAULT_SLUG },
    include: { settings: true, plan: { include: { features: { include: { feature: true } } } } },
  });
  if (!company) {
    throw new Error(
      `Empresa padrão "${DEFAULT_SLUG}" não encontrada. Rode o seed (npm run db:seed).`,
    );
  }
  return company;
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
    include: { settings: true },
  });
}

export async function getCompanyById(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: { settings: true },
  });
}

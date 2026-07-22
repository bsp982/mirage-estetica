import { prisma } from "./db";
import type { Service } from "./types";
import { getDefaultCompany } from "./tenant";

export { BUSINESS, SELLER, BASE_SLOTS } from "./brand";
export { formatBRL } from "./money";

function mapService(row: {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  durationHours: number;
  priceFrom: number;
  category: string | null;
  imageUrl: string | null;
  active: boolean;
  packages: {
    id: string;
    slug: string;
    name: string;
    description: string;
    included: boolean;
  }[];
}): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description,
    durationHours: row.durationHours,
    priceFrom: row.priceFrom,
    category: row.category,
    imageUrl: row.imageUrl,
    active: row.active,
    packages: row.packages.map((p) => ({
      id: p.slug,
      slug: p.slug,
      name: p.name,
      description: p.description,
      included: p.included,
    })),
  };
}

export async function listActiveServices(
  companyId?: string,
): Promise<Service[]> {
  const cid = companyId ?? (await getDefaultCompany()).id;
  const rows = await prisma.service.findMany({
    where: { companyId: cid, active: true },
    include: { packages: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapService);
}

export async function getServiceById(
  idOrSlug: string,
  companyId?: string,
): Promise<Service | undefined> {
  const cid = companyId ?? (await getDefaultCompany()).id;
  const row = await prisma.service.findFirst({
    where: {
      companyId: cid,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: { packages: { orderBy: { sortOrder: "asc" } } },
  });
  return row ? mapService(row) : undefined;
}

export async function getBusinessProfile(companyId?: string) {
  const company = companyId
    ? await prisma.company.findUnique({
        where: { id: companyId },
        include: { settings: true },
      })
    : await getDefaultCompany();

  if (!company) {
    throw new Error("Empresa não encontrada");
  }

  const s = company.settings;
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    shortName: company.name.toUpperCase(),
    mark: company.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    handle: s?.instagram
      ? `@${s.instagram.replace(/^@/, "").split("/").pop()}`
      : "@sua_estetica",
    motto: s?.motto ?? "Seu carro foi feito para brilhar",
    city: "Demonstração",
    phone: s?.phone ?? "",
    phoneHref: s?.phone ? `tel:${s.phone.replace(/\D/g, "")}` : "#",
    whatsappHref: s?.whatsapp
      ? `https://wa.me/${s.whatsapp.replace(/\D/g, "")}`
      : "#",
    instagramHref: s?.instagram ?? "https://www.instagram.com/",
    hoursLabel: s?.hoursLabel ?? "Seg a Sáb · 08h às 18h",
    addressHint: s?.address ?? "",
    description: s?.description ?? "",
    about: s?.about ?? "",
    primaryColor: s?.primaryColor ?? "#0b2a8f",
    secondaryColor: s?.secondaryColor ?? "#e0b12a",
    heroImageUrl: s?.heroImageUrl ?? "/hero/hero-main.jpg",
    showTestimonials: s?.showTestimonials ?? true,
    showGallery: s?.showGallery ?? true,
    showAbout: s?.showAbout ?? true,
    showServices: s?.showServices ?? true,
    showCta: s?.showCta ?? true,
    showContact: s?.showContact ?? true,
  };
}

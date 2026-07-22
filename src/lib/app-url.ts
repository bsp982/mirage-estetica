/** URL pública da plataforma (links em e-mails e onboarding). */
export function getAppBaseUrl(): string {
  const explicit =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return `https://${productionHost.replace(/\/$/, "")}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "https://estetica-automotiva-crm.vercel.app";
}

export function tenantSiteUrl(slug: string): string {
  return `${getAppBaseUrl()}/s/${slug}`;
}

export function gestorLoginUrl(): string {
  return `${getAppBaseUrl()}/gestor/login`;
}

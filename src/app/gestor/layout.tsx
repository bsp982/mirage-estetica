import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getCompanyFeatureCodes } from "@/lib/features";
import { prisma } from "@/lib/db";

const NAV = [
  { href: "/gestor", label: "Dashboard", feature: null },
  { href: "/gestor/agenda", label: "Agenda", feature: "AGENDA" },
  { href: "/gestor/clientes", label: "Clientes", feature: "BASIC_CUSTOMER" },
  { href: "/gestor/veiculos", label: "Veículos", feature: "BASIC_VEHICLE" },
  { href: "/gestor/servicos", label: "Serviços", feature: "SERVICES" },
  { href: "/gestor/financeiro", label: "Financeiro", feature: "FINANCIAL" },
  { href: "/gestor/indicacoes", label: "Indicações", feature: "REFERRAL" },
  { href: "/gestor/configuracoes", label: "Configurações", feature: null },
] as const;

export default async function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // login page uses its own layout via route group? — check path via children only
  // This layout wraps all /gestor/* including login — skip auth for login by checking session soft
  const session = await getSession();

  // Login page is under /gestor/login — allow without shell
  // We detect by absence of session and render children only when on login... 
  // Better: move login outside. For now, if no session, just children (login handles itself).
  if (!session) {
    return <>{children}</>;
  }

  const features = await getCompanyFeatureCodes(session.companyId);
  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
  });

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_#0b2a8f_0%,_#050914_55%)]">
      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
            CRM
          </p>
          <h1 className="mt-1 font-display text-2xl text-white">
            {company?.name ?? "Estética"}
          </h1>
          <p className="mt-1 text-xs text-white/45">{session.email}</p>
          <nav className="mt-6 space-y-1">
            {NAV.map((item) => {
              if (item.feature && !features.has(item.feature)) return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={`/s/${company?.slug ?? ""}`}
              className="mt-4 block rounded-lg px-3 py-2 text-sm text-brand-gold/80 hover:text-brand-gold"
            >
              Ver site público
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

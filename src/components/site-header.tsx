import Link from "next/link";
import { BUSINESS } from "@/lib/brand";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 backdrop-blur-md ${
        solid ? "bg-brand-blue-deep/95" : "bg-[#050914]/75"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-gold/50 bg-brand-blue text-[10px] font-bold text-brand-gold">
            {BUSINESS.mark}
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg text-brand-gold group-hover:text-brand-gold-soft">
              {BUSINESS.shortName}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-white/70">
              Demo de agendamento
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#servicos"
            className="hidden text-sm text-white/75 transition hover:text-white sm:inline"
          >
            Serviços
          </Link>
          <Link
            href="/agendar"
            className="rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-gold-soft"
          >
            Agendar
          </Link>
          <Link
            href="/gestor/login"
            className="rounded-full border border-white/20 px-3 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Gestor
          </Link>
        </nav>
      </div>
      <p className="sr-only">{BUSINESS.motto}</p>
    </header>
  );
}

import Link from "next/link";
import { BUSINESS } from "@/lib/services";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 backdrop-blur-md ${
        solid ? "bg-mirage-blue-deep/95" : "bg-[#050914]/75"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-mirage-gold/50 bg-mirage-blue text-[10px] font-bold text-mirage-gold">
            M
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg text-mirage-gold group-hover:text-mirage-gold-soft">
              MIRAGE
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-white/70">
              Estética Automotiva
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
            className="rounded-full bg-mirage-gold px-4 py-2 text-sm font-semibold text-mirage-ink transition hover:bg-mirage-gold-soft"
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

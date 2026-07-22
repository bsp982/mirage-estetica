import Link from "next/link";
import { PLATFORM } from "@/lib/platform";

export function PlatformHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050914]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-gold/50 bg-brand-blue text-[10px] font-bold text-brand-gold">
            {PLATFORM.mark}
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg text-brand-gold group-hover:text-brand-gold-soft">
              {PLATFORM.shortName}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-white/55">
              SaaS para estéticas
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#planos"
            className="hidden text-sm text-white/70 hover:text-white sm:inline"
          >
            Planos
          </Link>
          <Link
            href="/s/estetica-mvp"
            className="hidden text-sm text-white/70 hover:text-white sm:inline"
          >
            Ver demo
          </Link>
          <Link
            href="/gestor/login"
            className="rounded-full border border-white/20 px-3 py-2 text-xs text-white/75 hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-gold-soft"
          >
            Começar grátis
          </Link>
        </nav>
      </div>
    </header>
  );
}

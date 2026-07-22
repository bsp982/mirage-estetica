import Link from "next/link";
import { BUSINESS, SELLER } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-blue-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-2xl text-brand-gold">
            {BUSINESS.shortName}
          </p>
          <p className="mt-1 text-sm text-white/70">{BUSINESS.motto}</p>
          <p className="mt-3 text-sm text-white/55">
            {BUSINESS.city} · {BUSINESS.hoursLabel}
          </p>
          <p className="text-sm text-white/55">{BUSINESS.addressHint}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link
            href="/agendar"
            className="text-brand-gold hover:text-brand-gold-soft"
          >
            Agendar pelo site
          </Link>
          <Link
            href="/gestor/login"
            className="text-white/80 hover:text-brand-gold"
          >
            Área do gestor
          </Link>
        </div>

        <div className="max-w-sm rounded-2xl border border-brand-gold/30 bg-black/25 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
            Quer este site na sua estética?
          </p>
          <p className="mt-2 text-sm text-white/75">
            Fale com {SELLER.name} e leve o agendamento online para o seu
            negócio.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <a
              href={SELLER.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-gold hover:text-brand-gold-soft"
            >
              {SELLER.whatsappLabel} →
            </a>
            <a
              href={SELLER.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-brand-gold"
            >
              Instagram {SELLER.handle}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

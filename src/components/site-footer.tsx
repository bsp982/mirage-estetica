import Link from "next/link";
import { BUSINESS } from "@/lib/services";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-mirage-blue-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl text-mirage-gold">MIRAGE</p>
          <p className="mt-1 text-sm text-white/70">{BUSINESS.motto}</p>
          <p className="mt-3 text-sm text-white/55">
            {BUSINESS.city} · {BUSINESS.hoursLabel}
          </p>
          <p className="text-sm text-white/55">{BUSINESS.addressHint}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <a
            href={BUSINESS.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="text-white/80 hover:text-mirage-gold"
          >
            WhatsApp {BUSINESS.phone}
          </a>
          <a
            href={BUSINESS.instagramHref}
            target="_blank"
            rel="noreferrer"
            className="text-white/80 hover:text-mirage-gold"
          >
            {BUSINESS.handle}
          </a>
          <Link href="/agendar" className="text-mirage-gold hover:text-mirage-gold-soft">
            Agendar pelo site
          </Link>
        </div>
      </div>
    </footer>
  );
}

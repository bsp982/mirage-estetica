import Link from "next/link";
import { PLATFORM } from "@/lib/platform";
import { SELLER } from "@/lib/brand";

export function PlatformFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-blue-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:justify-between">
        <div>
          <p className="font-display text-2xl text-brand-gold">
            {PLATFORM.shortName}
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/65">
            {PLATFORM.description}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/70">
          <Link href="/onboarding" className="hover:text-brand-gold">
            Criar conta FREE
          </Link>
          <Link href="/gestor/login" className="hover:text-brand-gold">
            Área do gestor
          </Link>
          <Link href="/s/estetica-mvp" className="hover:text-brand-gold">
            Demonstração
          </Link>
          <Link href="/termos" className="hover:text-brand-gold">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="hover:text-brand-gold">
            Privacidade
          </Link>
        </div>
        <div className="text-sm text-white/55">
          <p>Dúvidas?</p>
          <a
            href={SELLER.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-brand-gold hover:text-brand-gold-soft"
          >
            Falar com {SELLER.name}
          </a>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import { PlatformHeader } from "@/components/platform-header";
import { PlatformFooter } from "@/components/platform-footer";
import {
  FREE_PLAN_BULLETS,
  PAID_PLAN_TEASERS,
  PLATFORM,
} from "@/lib/platform";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <PlatformHeader />

      <main className="flex-1">
        <section className="relative min-h-[88vh] overflow-hidden">
          <Image
            src="/hero/hero-main.jpg"
            alt="Estética automotiva profissional"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(5,9,20,0.92) 0%, rgba(5,9,20,0.7) 45%, rgba(5,9,20,0.45) 100%)",
            }}
          />
          <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-24 sm:justify-center sm:pb-24">
            <p className="animate-fade-up text-xs uppercase tracking-[0.35em] text-brand-gold">
              Para donos de estética automotiva
            </p>
            <h1 className="animate-fade-up-delay font-display mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              {PLATFORM.shortName}
            </h1>
            <div className="animate-line mt-5 h-[3px] w-28 bg-brand-gold" />
            <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
              {PLATFORM.tagline}. Cadastre sua estética, publique o site e
              comece a receber agendamentos — no plano gratuito.
            </p>
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <Link
                href="/onboarding"
                className="rounded-full bg-brand-gold px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-ink hover:bg-brand-gold-soft"
              >
                Criar minha estética grátis
              </Link>
              <Link
                href="/s/estetica-mvp"
                className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white hover:border-white/50"
              >
                Ver demonstração
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-brand-blue-deep/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
            {[
              {
                title: "Site da sua marca",
                text: "Página com serviços, horários e identidade da sua estética.",
              },
              {
                title: "Agenda sem planilha",
                text: "Cliente agenda sozinho. Você acompanha e avança o status no painel.",
              },
              {
                title: "Cliente automático",
                text: "Nome e WhatsApp no agendamento já viram cadastro no CRM.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold">
                  {item.title}
                </h2>
                <p className="mt-2 text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-gold">
            Monetização simples
          </p>
          <h2 className="font-display mt-3 text-5xl text-white sm:text-6xl">
            Comece grátis. Evolua quando precisar.
          </h2>
          <p className="mt-4 max-w-2xl text-white/65">
            O plano FREE já gera valor: presença digital e agenda. Os planos
            pagos desbloqueiam operação e crescimento.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <article className="rounded-[1.75rem] border border-brand-gold/40 bg-gradient-to-b from-brand-blue/50 to-transparent p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
                FREE
              </p>
              <p className="mt-2 font-display text-4xl text-white">R$ 0</p>
              <ul className="mt-6 space-y-3 text-sm text-white/75">
                {FREE_PLAN_BULLETS.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="mt-8 inline-flex rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink"
              >
                Criar conta FREE
              </Link>
            </article>

            {PAID_PLAN_TEASERS.map((p) => (
              <article
                key={p.plan}
                className="rounded-[1.75rem] border border-white/10 bg-black/20 p-7"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                  {p.plan}
                </p>
                <p className="mt-2 font-display text-4xl text-white">
                  {p.price}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/70">
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-xs text-white/40">
                  Upgrade pelo painel quando a operação pedir.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-white/10">
          <Image
            src="/hero/hero-shop.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/90 to-[#050914]/95" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-5xl text-white">
                Sua estética online em minutos
              </h2>
              <p className="mt-3 max-w-lg text-white/75">
                Sem cartão no FREE. Cadastre, compartilhe o link do site e
                receba o primeiro agendamento.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="rounded-full bg-brand-gold px-8 py-4 text-sm font-bold uppercase tracking-wide text-brand-ink"
            >
              Começar agora
            </Link>
          </div>
        </section>
      </main>

      <PlatformFooter />
    </div>
  );
}

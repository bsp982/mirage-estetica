import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BUSINESS, SERVICES, formatBRL } from "@/lib/services";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative min-h-[88vh] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 70% 20%, #1436a8 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, #0b2a8f 0%, transparent 50%), linear-gradient(160deg, #050914 0%, #061a5c 45%, #050914 100%)",
            }}
          />
          <div
            className="hero-glow pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-mirage-gold/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />

          <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-24 sm:justify-center sm:pb-24">
            <p className="animate-fade-up text-xs uppercase tracking-[0.35em] text-mirage-gold">
              {BUSINESS.city} · Detailer profissional
            </p>
            <h1 className="animate-fade-up-delay font-display mt-4 max-w-4xl text-6xl leading-[0.92] text-white sm:text-8xl">
              MIRAGE
              <span className="mt-2 block text-3xl tracking-[0.12em] text-mirage-gold sm:text-4xl">
                ESTÉTICA AUTOMOTIVA
              </span>
            </h1>
            <div className="animate-line mt-5 h-[3px] w-28 bg-mirage-gold" />
            <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
              {BUSINESS.motto}. Agende seu horário pelo site — escolha o
              serviço, o pacote e o melhor horário, sem espera no WhatsApp.
            </p>
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <Link
                href="/agendar"
                className="rounded-full bg-mirage-gold px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-mirage-ink transition hover:bg-mirage-gold-soft"
              >
                Agendar agora
              </Link>
              <a
                href="#servicos"
                className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/50"
              >
                Ver serviços
              </a>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-mirage-blue-deep/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:grid-cols-3">
            {[
              {
                title: "Só com agendamento",
                text: "Seu horário é exclusivo. Sem fila e sem surpresa.",
              },
              {
                title: "Pacotes transparentes",
                text: "Veja o que está incluso e adicione opcionais em segundos.",
              },
              {
                title: "Privacidade no calendário",
                text: "Horários ocupados ficam bloqueados — sem mostrar nomes de outros clientes.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-mirage-gold">
                  {item.title}
                </h2>
                <p className="mt-2 text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="servicos" className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs uppercase tracking-[0.28em] text-mirage-gold">
            Serviços Mirage
          </p>
          <h2 className="font-display mt-3 text-5xl text-white sm:text-6xl">
            Escolha o cuidado certo
          </h2>
          <p className="mt-4 max-w-2xl text-white/65">
            Cada serviço já traz pacotes inclusos. No agendamento você confirma
            os itens e reserva o horário ideal.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SERVICES.map((service) => (
              <article
                key={service.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-mirage-blue/40 to-transparent p-7 transition hover:border-mirage-gold/40"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-mirage-gold">
                  a partir de {formatBRL(service.priceFrom)} ·{" "}
                  {service.durationHours}h
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {service.name}
                </h3>
                <p className="mt-2 text-white/70">{service.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {service.packages
                    .filter((p) => p.included)
                    .map((pkg) => (
                      <li
                        key={pkg.id}
                        className="flex items-start gap-2 text-sm text-white/75"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mirage-gold" />
                        {pkg.name}
                      </li>
                    ))}
                </ul>
                <Link
                  href={`/agendar?servico=${service.id}`}
                  className="mt-7 inline-flex text-sm font-semibold text-mirage-gold transition group-hover:text-mirage-gold-soft"
                >
                  Agendar este serviço →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-white/10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, #0b2a8f 0%, #061a5c 55%, #050914 100%)",
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-5xl text-white sm:text-6xl">
                Pronto para brilhar?
              </h2>
              <p className="mt-3 max-w-lg text-white/75">
                Reserve em minutos pelo site. A equipe Mirage prepara tudo para
                o seu veículo.
              </p>
            </div>
            <Link
              href="/agendar"
              className="rounded-full bg-mirage-gold px-8 py-4 text-sm font-bold uppercase tracking-wide text-mirage-ink hover:bg-mirage-gold-soft"
            >
              Ir para agendamento
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/tenant";
import { listActiveServices } from "@/lib/services";
import { formatBRL } from "@/lib/money";
import { prisma } from "@/lib/db";
import { BookingWizard } from "@/components/booking-wizard";
import { BeforeAfterGallery } from "@/components/before-after-gallery";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ servico?: string }>;
};

const SERVICE_IMAGES = [
  "/hero/hero-detail.jpg",
  "/hero/hero-workshop.jpg",
  "/hero/hero-polish.jpg",
  "/hero/hero-ceramic.jpg",
];

export default async function TenantSitePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { servico } = await searchParams;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const settings = company.settings;
  const services = await listActiveServices(company.id);
  const testimonials = await prisma.testimonial.findMany({
    where: { companyId: company.id, active: true },
    take: 4,
  });
  const gallery = await prisma.galleryItem.findMany({
    where: { companyId: company.id, active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 12,
  });

  return (
    <div className="min-h-full bg-[#050914] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050914]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
              {settings?.hoursLabel}
            </p>
            <h1 className="font-display text-3xl">{company.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(settings?.showGallery ?? true) && gallery.length > 0 && (
              <a
                href="#galeria"
                className="hidden rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 sm:inline"
              >
                Antes e depois
              </a>
            )}
            <Link
              href={`/s/${slug}#agendar`}
              className="rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-gold-soft"
            >
              Agendar
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[78vh] overflow-hidden">
        <Image
          src={settings?.heroImageUrl || "/hero/hero-main.jpg"}
          alt=""
          fill
          className="object-cover opacity-60 animate-ken-burns"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/55 to-[#050914]/25" />
        <div
          className="hero-glow pointer-events-none absolute -right-16 top-16 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-float-soft pointer-events-none absolute bottom-24 left-10 h-40 w-40 rounded-full bg-brand-blue/40 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-5xl flex-col justify-end px-5 pb-16 pt-28">
          <p className="animate-fade-up text-xs uppercase tracking-[0.28em] text-brand-gold">
            Estética automotiva
          </p>
          <h2 className="animate-fade-up-delay font-display mt-3 max-w-3xl text-5xl leading-[0.95] text-white sm:text-7xl">
            {settings?.motto || company.name}
          </h2>
          <div className="animate-line mt-5 h-[3px] w-24 bg-brand-gold" />
          <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-lg text-white/80">
            {settings?.description || settings?.about}
          </p>
          <div className="animate-fade-up-delay-2 mt-8">
            <Link
              href={`#agendar`}
              className="inline-flex rounded-full bg-brand-gold px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-ink transition hover:bg-brand-gold-soft"
            >
              Reservar horário
            </Link>
          </div>
        </div>
      </section>

      {(settings?.showServices ?? true) && (
        <section className="mx-auto max-w-5xl px-5 py-14">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
            Serviços
          </p>
          <h3 className="font-display mt-2 text-4xl text-white">
            Escolha o cuidado
          </h3>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {services.map((s, index) => {
              const img =
                s.imageUrl || SERVICE_IMAGES[index % SERVICE_IMAGES.length];
              return (
                <Link
                  key={s.id}
                  href={`/s/${slug}?servico=${s.slug}#agendar`}
                  className="card-lift media-shine group relative block min-h-[220px] overflow-hidden rounded-[1.5rem] border border-white/10"
                >
                  <Image
                    src={img}
                    alt={s.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/5 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end p-6">
                    <p className="text-xs text-brand-gold">
                      {formatBRL(s.priceFrom)} · {s.durationHours}h
                    </p>
                    <h4 className="mt-2 text-2xl font-semibold">{s.name}</h4>
                    <p className="mt-1 text-sm text-white/75">{s.tagline}</p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wider text-white/55 group-hover:text-brand-gold">
                      Agendar este serviço →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {(settings?.showGallery ?? true) && (
        <BeforeAfterGallery items={gallery} />
      )}

      {(settings?.showTestimonials ?? true) && testimonials.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 py-10">
          <h3 className="font-display text-3xl">Depoimentos</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <blockquote
                key={t.id}
                className="card-lift rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/80"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                “{t.comment}”
                <footer className="mt-3 text-brand-gold">{t.customerName}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section id="agendar" className="relative overflow-hidden border-t border-white/10">
        <Image
          src="/hero/hero-shop.jpg"
          alt=""
          fill
          className="pointer-events-none object-cover opacity-25 animate-ken-burns"
          sizes="100vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050914]/85 via-brand-blue-deep/80 to-[#050914]" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-16">
          <p className="animate-fade-up text-xs uppercase tracking-[0.24em] text-brand-gold">
            Agendamento online
          </p>
          <h3 className="animate-fade-up-delay font-display mt-2 text-4xl text-white sm:text-5xl">
            Reserve seu horário
          </h3>
          <p className="animate-fade-up-delay-2 mt-3 text-sm text-white/65">
            Escolha o serviço, o pacote e o melhor horário. Seu cadastro entra
            automático pelo WhatsApp.
          </p>
          <div className="booking-stage animate-reveal-up mt-8 rounded-[1.75rem] border border-white/10 bg-black/45 p-5 backdrop-blur-md sm:p-8">
            {services.length > 0 ? (
              <BookingWizard
                services={services}
                initialServiceId={servico}
                companyId={company.id}
                companyWhatsapp={settings?.whatsapp}
                homeHref={`/s/${slug}`}
              />
            ) : (
              <p className="text-white/50">Sem serviços ativos.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

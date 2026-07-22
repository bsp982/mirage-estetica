"use client";

import Image from "next/image";

export type BeforeAfterItem = {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  description: string | null;
  vehicleLabel: string | null;
};

export function BeforeAfterGallery({
  items,
}: {
  items: BeforeAfterItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section id="galeria" className="mx-auto max-w-5xl px-5 py-12">
      <p className="animate-fade-up text-xs uppercase tracking-[0.22em] text-brand-gold">
        Resultados
      </p>
      <h3 className="animate-fade-up-delay font-display mt-2 text-4xl text-white sm:text-5xl">
        Antes e depois
      </h3>
      <p className="animate-fade-up-delay-2 mt-3 max-w-xl text-sm text-white/60">
        Veja a transformação: carro sujo na entrada e o acabamento depois do
        serviço.
      </p>

      <div className="mt-8 space-y-10">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="animate-reveal-up space-y-3"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="media-shine group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={item.beforeUrl}
                  alt={
                    item.vehicleLabel
                      ? `Antes — ${item.vehicleLabel}`
                      : "Antes do serviço"
                  }
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  unoptimized={item.beforeUrl.startsWith("/uploads/")}
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Antes
                </span>
              </div>
              <div className="media-shine group relative aspect-[4/3] overflow-hidden rounded-2xl border border-brand-gold/30">
                <Image
                  src={item.afterUrl}
                  alt={
                    item.vehicleLabel
                      ? `Depois — ${item.vehicleLabel}`
                      : "Depois do serviço"
                  }
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  unoptimized={item.afterUrl.startsWith("/uploads/")}
                />
                <span className="absolute left-3 top-3 rounded-full bg-brand-gold px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink">
                  Depois
                </span>
              </div>
            </div>
            {(item.vehicleLabel || item.description) && (
              <p className="text-sm text-white/65">
                {item.vehicleLabel}
                {item.vehicleLabel && item.description ? " · " : ""}
                {item.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

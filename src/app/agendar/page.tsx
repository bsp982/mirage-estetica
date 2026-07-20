import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookingWizard } from "@/components/booking-wizard";
import { SERVICES } from "@/lib/services";

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const params = await searchParams;
  const initial =
    SERVICES.find((s) => s.id === params.servico)?.id ?? SERVICES[0].id;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader solid />
      <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#0b2a8f_0%,_#050914_55%)]">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-gold">
            Agendamento online
          </p>
          <h1 className="font-display mt-3 text-5xl text-white sm:text-6xl">
            Reserve seu horário
          </h1>
          <p className="mt-4 text-white/70">
            Escolha o serviço, confirme os pacotes e selecione um horário livre.
            Horários ocupados aparecem bloqueados — sem revelar dados de outros
            clientes.
          </p>
          <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-black/25 p-5 sm:p-8">
            <BookingWizard initialServiceId={initial} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

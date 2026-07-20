"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getServiceById } from "@/lib/services";
import { ManagerCalendar } from "@/components/manager-calendar";

type AgendaItem = {
  id: string;
  serviceId: string;
  serviceName: string;
  packageIds: string[];
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerCar: string;
  notes: string;
  createdAt: string;
};

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ManagerAgenda() {
  const router = useRouter();
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const me = await fetch("/api/auth/me");
        const meData = await me.json();
        if (!meData.authenticated) {
          router.replace("/gestor/login");
          return;
        }
        const res = await fetch("/api/appointments");
        if (res.status === 401) {
          router.replace("/gestor/login");
          return;
        }
        const data = await res.json();
        if (!cancelled) setItems(data.appointments ?? []);
      } catch {
        if (!cancelled) setError("Falha ao carregar agenda");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.replace("/gestor/login");
  }

  const countsByDate = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.date] = (acc[item.date] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const dayItems = useMemo(
    () =>
      items
        .filter((item) => item.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [items, selectedDate],
  );

  const selectedLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "pt-BR",
    { weekday: "long", day: "2-digit", month: "long" },
  );

  function goToday() {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(toISODate(now));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
            Painel do gestor
          </p>
          <h1 className="font-display mt-1 text-4xl text-white">Agenda</h1>
          <p className="mt-2 text-sm text-white/60">
            Calendário mensal com os agendamentos do dia selecionado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          Sair
        </button>
      </div>

      {loading && <p className="text-white/60">Carregando…</p>}
      {error && <p className="text-red-300">{error}</p>}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
          <ManagerCalendar
            month={month}
            selectedDate={selectedDate}
            countsByDate={countsByDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={() =>
              setMonth(
                (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
              )
            }
            onNextMonth={() =>
              setMonth(
                (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
              )
            }
            onToday={goToday}
          />

          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">
              Dia selecionado
            </p>
            <h2 className="mt-2 capitalize text-xl font-semibold text-white">
              {selectedLabel}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {dayItems.length === 0
                ? "Nenhum agendamento neste dia"
                : `${dayItems.length} agendamento${dayItems.length > 1 ? "s" : ""}`}
            </p>

            <div className="mt-5 space-y-3">
              {dayItems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">
                  Clique em outro dia no calendário ou aguarde novas reservas
                  pelo site.
                </div>
              )}

              {dayItems.map((item) => {
                const service = getServiceById(item.serviceId);
                const packages =
                  service?.packages
                    .filter((p) => item.packageIds.includes(p.id))
                    .map((p) => p.name)
                    .join(", ") ?? item.packageIds.join(", ");

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-white">
                          {item.time}
                        </p>
                        <p className="text-sm text-brand-gold">
                          {item.serviceName}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-3 grid gap-2 text-sm text-white/75">
                      <div>
                        <dt className="text-white/40">Cliente</dt>
                        <dd>{item.customerName}</dd>
                      </div>
                      <div>
                        <dt className="text-white/40">Telefone</dt>
                        <dd>{item.customerPhone}</dd>
                      </div>
                      <div>
                        <dt className="text-white/40">Veículo</dt>
                        <dd>{item.customerCar || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-white/40">Pacotes</dt>
                        <dd>{packages}</dd>
                      </div>
                      {item.notes && (
                        <div>
                          <dt className="text-white/40">Observações</dt>
                          <dd>{item.notes}</dd>
                        </div>
                      )}
                    </dl>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

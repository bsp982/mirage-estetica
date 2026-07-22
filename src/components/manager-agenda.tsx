"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ManagerCalendar } from "@/components/manager-calendar";
import { STATUS_FLOW, type AppointmentStatus } from "@/lib/types";

type AgendaItem = {
  id: string;
  serviceId: string;
  serviceName: string;
  packageIds: string[];
  date: string;
  time: string;
  status: AppointmentStatus;
  price?: number | null;
  customerName: string;
  customerPhone: string;
  customerCar: string;
  notes: string;
  createdAt: string;
};

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const STATUS_LABEL: Record<string, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_EXECUCAO: "Em execução",
  AGUARDANDO_RETIRADA: "Aguardando retirada",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  NAO_COMPARECEU: "Não compareceu",
};

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
  const [busyId, setBusyId] = useState("");

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
      setItems(data.appointments ?? []);
    } catch {
      setError("Falha ao carregar agenda");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.replace("/gestor/login");
  }

  async function patchStatus(id: string, status: AppointmentStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao atualizar status");
    } finally {
      setBusyId("");
    }
  }

  const countsByDate = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      if (item.status === "CANCELADO") return acc;
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
            Operação
          </p>
          <h1 className="font-display mt-1 text-4xl text-white">Agenda</h1>
          <p className="mt-2 text-sm text-white/60">
            Avance o status do serviço. Clientes já vêm vinculados pelo site.
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
              setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
            onNextMonth={() =>
              setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
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
              {dayItems.map((item) => {
                const next = STATUS_FLOW[item.status];
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
                      <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/70">
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-2 text-sm text-white/75">
                      <div>
                        <dt className="text-white/40">Cliente</dt>
                        <dd>
                          {item.customerName} · {item.customerPhone}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/40">Veículo</dt>
                        <dd>{item.customerCar || "—"}</dd>
                      </div>
                      {item.notes && (
                        <div>
                          <dt className="text-white/40">Observações</dt>
                          <dd>{item.notes}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {next && (
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => void patchStatus(item.id, next)}
                          className="rounded-full bg-brand-gold px-3 py-1.5 text-xs font-semibold text-brand-ink disabled:opacity-50"
                        >
                          → {STATUS_LABEL[next]}
                        </button>
                      )}
                      {item.status !== "CANCELADO" &&
                        item.status !== "FINALIZADO" && (
                          <button
                            type="button"
                            disabled={busyId === item.id}
                            onClick={() =>
                              void patchStatus(item.id, "CANCELADO")
                            }
                            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/70"
                          >
                            Cancelar
                          </button>
                        )}
                      {item.status === "CONFIRMADO" && (
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() =>
                            void patchStatus(item.id, "NAO_COMPARECEU")
                          }
                          className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/70"
                        >
                          Não compareceu
                        </button>
                      )}
                    </div>
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

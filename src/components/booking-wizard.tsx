"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  SERVICES,
  formatBRL,
  getServiceById,
} from "@/lib/services";
import type { Service } from "@/lib/types";

type Step = 1 | 2 | 3 | 4 | 5;

function todayISO(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function defaultPackages(service: Service): string[] {
  return service.packages.filter((p) => p.included).map((p) => p.id);
}

export function BookingWizard({
  initialServiceId,
}: {
  initialServiceId?: string;
}) {
  const initial = getServiceById(initialServiceId ?? "") ?? SERVICES[0];
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState(initial.id);
  const [packageIds, setPackageIds] = useState<string[]>(
    defaultPackages(initial),
  );
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("");
  const [available, setAvailable] = useState<string[]>([]);
  const [occupied, setOccupied] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCar, setCustomerCar] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState("");

  const service = useMemo(
    () => getServiceById(serviceId) ?? SERVICES[0],
    [serviceId],
  );

  useEffect(() => {
    setPackageIds(defaultPackages(service));
    setTime("");
  }, [service]);

  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      setSlotsLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/slots?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`,
        );
        const data = await res.json();
        if (cancelled) return;
        setAvailable(data.available ?? []);
        setOccupied(data.occupied ?? []);
        setClosed(Boolean(data.closed));
        setTime((current) =>
          current && !(data.available ?? []).includes(current) ? "" : current,
        );
      } catch {
        if (!cancelled) setError("Não foi possível carregar horários");
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    if (step >= 3) {
      void loadSlots();
    }
    return () => {
      cancelled = true;
    };
  }, [date, serviceId, step]);

  function togglePackage(id: string) {
    setPackageIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          packageIds,
          date,
          time,
          customerName,
          customerPhone,
          customerCar,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao agendar");
      }
      setDoneId(data.appointment.id);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao agendar");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { n: 1, label: "Serviço" },
    { n: 2, label: "Pacote" },
    { n: 3, label: "Horário" },
    { n: 4, label: "Dados" },
  ] as const;

  if (step === 5) {
    return (
      <div className="rounded-3xl border border-mirage-gold/30 bg-mirage-blue-deep/60 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-mirage-gold">
          Agendamento confirmado
        </p>
        <h2 className="font-display mt-3 text-4xl text-white">Tudo certo!</h2>
        <p className="mx-auto mt-4 max-w-md text-white/75">
          Seu horário na Mirage está reservado. Chegue no horário marcado e
          deixe o resto com a gente.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm text-white/80">
          <p>
            <span className="text-white/50">Serviço:</span> {service.name}
          </p>
          <p>
            <span className="text-white/50">Quando:</span> {date} às {time}
          </p>
          <p>
            <span className="text-white/50">Código:</span> {doneId}
          </p>
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-mirage-gold px-6 py-3 font-semibold text-mirage-ink"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => s.n < step && setStep(s.n)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              step === s.n
                ? "bg-mirage-gold text-mirage-ink"
                : step > s.n
                  ? "bg-white/10 text-white"
                  : "bg-white/5 text-white/40"
            }`}
          >
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          {SERVICES.map((item) => {
            const active = item.id === serviceId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setServiceId(item.id)}
                className={`rounded-3xl border p-5 text-left transition ${
                  active
                    ? "border-mirage-gold bg-mirage-blue/50"
                    : "border-white/10 bg-white/5 hover:border-white/25"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-mirage-gold">
                  a partir de {formatBRL(item.priceFrom)}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-white/65">{item.tagline}</p>
                <p className="mt-3 text-xs text-white/45">
                  Duração estimada: {item.durationHours}h
                </p>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-white/65">
            Itens marcados como inclusos já vêm no serviço. Você pode adicionar
            opcionais.
          </p>
          <div className="grid gap-3">
            {service.packages.map((pkg) => {
              const checked = packageIds.includes(pkg.id);
              return (
                <label
                  key={pkg.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                    checked
                      ? "border-mirage-gold/60 bg-mirage-blue/40"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePackage(pkg.id)}
                    className="mt-1 accent-[#e0b12a]"
                  />
                  <span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-white">{pkg.name}</span>
                      {pkg.included && (
                        <span className="rounded-full bg-mirage-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-mirage-gold">
                          Incluso
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-white/60">
                      {pkg.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/70">Data</label>
            <input
              type="date"
              min={todayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-mirage-gold"
            />
          </div>
          {closed ? (
            <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Fechado aos domingos. Escolha outro dia.
            </p>
          ) : slotsLoading ? (
            <p className="text-sm text-white/55">Carregando horários…</p>
          ) : (
            <div>
              <p className="mb-3 text-sm text-white/70">
                Horários disponíveis — ocupados ficam bloqueados (sem exibir
                nomes de outros clientes).
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {[...available, ...occupied]
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .sort()
                  .map((slot) => {
                    const isOccupied = occupied.includes(slot);
                    const selected = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setTime(slot)}
                        className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                          isOccupied
                            ? "cursor-not-allowed bg-white/5 text-white/25 line-through"
                            : selected
                              ? "bg-mirage-gold text-mirage-ink"
                              : "bg-white/10 text-white hover:bg-white/15"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
              </div>
              {available.length === 0 && (
                <p className="mt-3 text-sm text-white/55">
                  Nenhum horário livre neste dia para este serviço.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-white/70">
              Seu nome *
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-mirage-gold"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">
              WhatsApp *
            </label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-mirage-gold"
              placeholder="(34) 9xxxx-xxxx"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">
              Veículo
            </label>
            <input
              value={customerCar}
              onChange={(e) => setCustomerCar(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-mirage-gold"
              placeholder="Ex: Civic 2020 branco"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-white/70">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-mirage-gold"
              placeholder="Algum detalhe importante?"
            />
          </div>
          <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
            <p>
              <strong className="text-white">{service.name}</strong> · {date} às{" "}
              {time || "—"}
            </p>
            <p className="mt-1">
              Pacotes:{" "}
              {service.packages
                .filter((p) => packageIds.includes(p.id))
                .map((p) => p.name)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 disabled:opacity-30"
        >
          Voltar
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 2 && packageIds.length === 0) {
                setError("Selecione ao menos um item do pacote");
                return;
              }
              if (step === 3 && !time) {
                setError("Escolha um horário disponível");
                return;
              }
              setError("");
              setStep((s) => (s + 1) as Step);
            }}
            className="rounded-full bg-mirage-gold px-6 py-2.5 text-sm font-semibold text-mirage-ink"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submit()}
            className="rounded-full bg-mirage-gold px-6 py-2.5 text-sm font-semibold text-mirage-ink disabled:opacity-60"
          >
            {submitting ? "Confirmando…" : "Confirmar agendamento"}
          </button>
        )}
      </div>
    </div>
  );
}

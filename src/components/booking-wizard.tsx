"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL } from "@/lib/money";
import { readApiJson } from "@/lib/http";
import type { Service } from "@/lib/types";

type Step = 1 | 2 | 3 | 4 | 5;

const SERVICE_IMAGES = [
  "/hero/hero-detail.jpg",
  "/hero/hero-workshop.jpg",
  "/hero/hero-polish.jpg",
  "/hero/hero-ceramic.jpg",
  "/hero/hero-shop.jpg",
];

function todayISO(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function defaultPackages(service: Service): string[] {
  return service.packages.filter((p) => p.included).map((p) => p.id);
}

function serviceImage(service: Service, index: number): string {
  return service.imageUrl || SERVICE_IMAGES[index % SERVICE_IMAGES.length];
}

export function BookingWizard({
  services,
  initialServiceId,
  companyId,
  companyWhatsapp,
  homeHref = "/",
}: {
  services: Service[];
  initialServiceId?: string;
  companyId?: string;
  companyWhatsapp?: string | null;
  homeHref?: string;
}) {
  const initial =
    services.find((s) => s.id === initialServiceId || s.slug === initialServiceId) ??
    services[0];
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState(initial?.id ?? "");
  const [packageIds, setPackageIds] = useState<string[]>(
    initial ? defaultPackages(initial) : [],
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
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState("");

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? services[0],
    [serviceId, services],
  );

  const serviceIndex = Math.max(
    0,
    services.findIndex((s) => s.id === service?.id),
  );
  const activeImage = service
    ? serviceImage(service, serviceIndex)
    : SERVICE_IMAGES[0];

  useEffect(() => {
    if (!service) return;
    setPackageIds(defaultPackages(service));
    setTime("");
  }, [service]);

  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      setSlotsLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({
          date,
          serviceId,
          ...(companyId ? { companyId } : {}),
        });
        const res = await fetch(`/api/slots?${qs.toString()}`);
        const data = await readApiJson<{
          available?: string[];
          occupied?: string[];
          closed?: boolean;
          error?: string;
        }>(res);
        if (!res.ok) {
          throw new Error(data.error || "Não foi possível carregar horários");
        }
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
  }, [date, serviceId, step, companyId]);

  function togglePackage(id: string) {
    setPackageIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    const name = customerName.trim();
    const phone = customerPhone.trim();
    if (name.length < 2) {
      setError("Informe seu nome completo.");
      setSubmitting(false);
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
      setSubmitting(false);
      return;
    }
    if (!time) {
      setError("Escolha um horário disponível");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          packageIds,
          date,
          time,
          customerName: name,
          customerPhone: phone,
          customerCar,
          notes,
          referralCode: referralCode || undefined,
          companyId,
        }),
      });
      const data = await readApiJson<{
        error?: string;
        appointment?: { id: string };
      }>(res);
      if (!res.ok) {
        throw new Error(data.error || "Falha ao agendar");
      }
      if (!data.appointment?.id) {
        throw new Error("Agendamento sem confirmação. Tente novamente.");
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
    const wa = (companyWhatsapp ?? "").replace(/\D/g, "");
    const waText = encodeURIComponent(
      `Olá! Acabei de agendar pelo site.\nServiço: ${service?.name}\nData: ${date} às ${time}\nNome: ${customerName}\nCódigo: ${doneId}`,
    );
    const waHref = wa ? `https://wa.me/${wa}?text=${waText}` : null;

    return (
      <div className="animate-success-burst relative overflow-hidden rounded-3xl border border-brand-gold/40 p-8 text-center">
        <div className="absolute inset-0">
          <Image
            src={activeImage}
            alt=""
            fill
            className="object-cover opacity-35 animate-ken-burns"
            sizes="800px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050914]/70 via-brand-blue-deep/85 to-[#050914]/95" />
        </div>
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold">
            Agendamento confirmado
          </p>
          <h2 className="font-display mt-3 text-4xl text-white">Tudo certo!</h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Seu horário está reservado. Chegue no horário e deixe o brilho
            conosco.
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/15 bg-black/35 p-4 text-left text-sm text-white/85 backdrop-blur-sm">
            <p>
              <span className="text-white/50">Serviço:</span> {service?.name}
            </p>
            <p>
              <span className="text-white/50">Quando:</span> {date} às {time}
            </p>
            <p>
              <span className="text-white/50">Código:</span> {doneId}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-brand-gold px-6 py-3 font-semibold text-brand-ink transition hover:bg-brand-gold-soft"
              >
                Confirmar no WhatsApp
              </a>
            )}
            <Link
              href={homeHref}
              className="inline-flex rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition hover:border-white/50"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
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
                ? "bg-brand-gold text-brand-ink shadow-[0_0_24px_rgba(224,177,42,0.35)]"
                : step > s.n
                  ? "bg-white/10 text-white"
                  : "bg-white/5 text-white/40"
            }`}
          >
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      <div key={step} className="animate-step-in">
        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((item, index) => {
              const active = item.id === serviceId;
              const img = serviceImage(item, index);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setServiceId(item.id);
                    setError("");
                    setStep(2);
                  }}
                  className={`card-lift media-shine group relative z-10 min-h-[210px] overflow-hidden rounded-3xl border text-left ${
                    active
                      ? "border-brand-gold ring-1 ring-brand-gold/60"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <Image
                    src={img}
                    alt={item.name}
                    fill
                    className={`object-cover transition duration-700 ${
                      active
                        ? "scale-105 animate-ken-burns"
                        : "scale-100 group-hover:scale-110"
                    }`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/55 to-[#050914]/15" />
                  <div className="relative flex h-full flex-col justify-end p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
                      a partir de {formatBRL(item.priceFrom)}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/75">{item.tagline}</p>
                    <p className="mt-3 text-xs text-white/50">
                      Duração estimada: {item.durationHours}h
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && service && (
          <div className="space-y-4">
            <div className="media-shine relative h-36 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={activeImage}
                alt={service.name}
                fill
                className="object-cover animate-ken-burns"
                sizes="800px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050914]/85 via-[#050914]/45 to-transparent" />
              <div className="relative flex h-full items-end p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">
                    Montando o pacote
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {service.name}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-white/65">
              Itens inclusos já vêm marcados. Adicione opcionais se quiser.
            </p>
            <div className="grid gap-3">
              {service.packages.map((pkg, i) => {
                const checked = packageIds.includes(pkg.id);
                return (
                  <label
                    key={pkg.id}
                    className={`card-lift flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                      checked
                        ? "border-brand-gold/60 bg-brand-blue/40"
                        : "border-white/10 bg-white/5"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
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
                          <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-gold">
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
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-brand-gold"
              />
            </div>
            {closed ? (
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Fechado aos domingos. Escolha outro dia.
              </p>
            ) : slotsLoading ? (
              <p className="animate-pulse text-sm text-white/55">
                Carregando horários…
              </p>
            ) : (
              <div>
                <p className="mb-3 text-sm text-white/70">
                  Escolha um horário livre — ocupados ficam bloqueados.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {[...available, ...occupied]
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .sort()
                    .map((slot, i) => {
                      const isOccupied = occupied.includes(slot);
                      const selected = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => setTime(slot)}
                          className={`animate-slot-pop rounded-xl px-3 py-3 text-sm font-medium transition ${
                            isOccupied
                              ? "cursor-not-allowed bg-white/5 text-white/25 line-through"
                              : selected
                                ? "bg-brand-gold text-brand-ink shadow-[0_0_20px_rgba(224,177,42,0.4)]"
                                : "bg-white/10 text-white hover:bg-white/15"
                          }`}
                          style={{ animationDelay: `${i * 35}ms` }}
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

        {step === 4 && service && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="media-shine relative sm:col-span-2 h-28 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={activeImage}
                alt=""
                fill
                className="object-cover animate-ken-burns"
                sizes="800px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050914]/9 to-[#050914]/35" />
              <div className="relative flex h-full items-end p-4 text-sm text-white/85">
                <p>
                  <strong className="text-white">{service.name}</strong> · {date}{" "}
                  às {time || "—"}
                </p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-white/70">
                Seu nome *
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-brand-gold"
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
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-brand-gold"
                placeholder="(34) 9xxxx-xxxx"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Veículo</label>
              <input
                value={customerCar}
                onChange={(e) => setCustomerCar(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-brand-gold"
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
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-brand-gold"
                placeholder="Algum detalhe importante?"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-white/70">
                Indicado por (telefone do amigo, opcional)
              </label>
              <input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-brand-gold"
                placeholder="Telefone de quem indicou"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="animate-step-in rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/40 disabled:opacity-30"
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
            className="rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-gold-soft"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submit()}
            className="rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-gold-soft disabled:opacity-60"
          >
            {submitting ? "Confirmando…" : "Confirmar agendamento"}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayISO(): string {
  const d = new Date();
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

type Props = {
  month: Date;
  selectedDate: string;
  countsByDate: Record<string, number>;
  onSelectDate: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

export function ManagerCalendar({
  month,
  selectedDate,
  countsByDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: Props) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const today = todayISO();

  const cells = useMemo(() => {
    const first = new Date(year, monthIndex, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const result: Array<{ iso: string | null; day: number | null }> = [];

    for (let i = 0; i < startPad; i += 1) {
      result.push({ iso: null, day: null });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push({ iso: toISODate(year, monthIndex, day), day });
    }
    while (result.length % 7 !== 0) {
      result.push({ iso: null, day: null });
    }
    return result;
  }, [year, monthIndex]);

  const title = month.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl capitalize text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToday}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Mês anterior"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/80 hover:border-brand-gold/50 hover:text-brand-gold"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Próximo mês"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/80 hover:border-brand-gold/50 hover:text-brand-gold"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="pb-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 sm:text-xs"
          >
            {label}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (!cell.iso || cell.day === null) {
            return <div key={`empty-${index}`} className="min-h-14 sm:min-h-16" />;
          }

          const count = countsByDate[cell.iso] ?? 0;
          const isSelected = cell.iso === selectedDate;
          const isToday = cell.iso === today;
          const isSunday = new Date(`${cell.iso}T12:00:00`).getDay() === 0;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDate(cell.iso!)}
              className={`relative flex min-h-14 flex-col items-start rounded-xl border p-1.5 text-left transition sm:min-h-16 sm:p-2 ${
                isSelected
                  ? "border-brand-gold bg-brand-blue/60"
                  : count > 0
                    ? "border-brand-gold/25 bg-brand-blue/25 hover:border-brand-gold/50"
                    : "border-white/8 bg-white/[0.03] hover:border-white/20"
              } ${isSunday ? "opacity-55" : ""}`}
            >
              <span
                className={`text-sm font-semibold ${
                  isToday ? "text-brand-gold" : "text-white"
                }`}
              >
                {cell.day}
              </span>
              {count > 0 && (
                <span className="mt-auto rounded-full bg-brand-gold/20 px-1.5 py-0.5 text-[10px] font-medium text-brand-gold">
                  {count} {count === 1 ? "agend." : "agend."}
                </span>
              )}
              {isToday && !isSelected && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-gold" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/45">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-blue/60 ring-1 ring-brand-gold/40" />
          Com agendamentos
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-gold" />
          Dia selecionado / hoje
        </span>
      </div>
    </div>
  );
}

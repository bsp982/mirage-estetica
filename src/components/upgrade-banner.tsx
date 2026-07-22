import Link from "next/link";

export function UpgradeBanner({
  featureLabel,
  planHint = "PRO",
}: {
  featureLabel: string;
  planHint?: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-200/90">
        Recurso do plano {planHint}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">{featureLabel}</h2>
      <p className="mt-2 text-sm text-white/65">
        Seu plano FREE já cobre site e agenda. Faça upgrade quando quiser
        liberar {featureLabel.toLowerCase()} e outros recursos de operação.
      </p>
      <p className="mt-4 text-xs text-white/45">
        Em breve: upgrade pelo painel. Por enquanto, fale conosco para ativar o{" "}
        {planHint}.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex text-sm font-semibold text-brand-gold hover:text-brand-gold-soft"
      >
        Ver planos na página inicial →
      </Link>
    </div>
  );
}

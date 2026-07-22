/** Normaliza telefone para dígitos (chave de vínculo no CRM). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Interpreta texto livre do wizard ("Honda Civic 2020 preto") em campos de veículo. */
export function parseVehicleLabel(label: string): {
  brand: string;
  model: string;
  year?: number;
  color?: string;
} {
  const raw = label.trim().replace(/\s+/g, " ");
  if (!raw) {
    return { brand: "Não informado", model: "Não informado" };
  }

  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : undefined;
  const withoutYear = yearMatch
    ? raw.replace(yearMatch[0], "").replace(/\s+/g, " ").trim()
    : raw;

  const parts = withoutYear.split(" ");
  if (parts.length === 1) {
    return { brand: parts[0], model: parts[0], year };
  }

  const brand = parts[0];
  const model = parts.slice(1).join(" ");
  return { brand, model, year };
}

export function vehicleDisplayName(v: {
  brand: string;
  model: string;
  year?: number | null;
  color?: string | null;
  plate?: string | null;
}): string {
  const bits = [`${v.brand} ${v.model}`.trim()];
  if (v.year) bits.push(String(v.year));
  if (v.color) bits.push(v.color);
  if (v.plate) bits.push(v.plate);
  return bits.join(" · ");
}

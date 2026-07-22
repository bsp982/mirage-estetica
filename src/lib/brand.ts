/** Fallbacks de marketing (seller) — não vêm do tenant. */
export const SELLER = {
  name: "Bruno",
  handle: "@dev_bruno_solucoes",
  instagramHref: "https://www.instagram.com/dev_bruno_solucoes/",
  whatsappHref: "https://ig.me/m/dev_bruno_solucoes",
  whatsappLabel: "Falar comigo no Instagram",
};

export const BASE_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

/** Fallback estático até o site carregar settings do tenant. */
export const BUSINESS = {
  name: "Estética MVP",
  shortName: "ESTÉTICA MVP",
  mark: "EM",
  handle: "@sua_estetica",
  motto: "Seu carro foi feito para brilhar",
  city: "Demonstração",
  phone: "(00) 00000-0000",
  phoneHref: "tel:+5500000000000",
  whatsappHref: "https://wa.me/5500000000000",
  instagramHref: "https://www.instagram.com/",
  hoursLabel: "Seg a Sáb · 08h às 18h",
  addressHint: "Atendimento apenas com agendamento · dados de demonstração",
};

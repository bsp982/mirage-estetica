import type { Service } from "./types";

export const BUSINESS = {
  name: "Mirage Estética Automotiva",
  handle: "@mirage_estetica_automotiva",
  motto: "Seu carro foi feito para brilhar",
  city: "Uberlândia-MG",
  phone: "(34) 99252-9160",
  phoneHref: "tel:+5534992529160",
  whatsappHref: "https://wa.me/5534992529160",
  instagramHref: "https://www.instagram.com/mirage_estetica_automotiva/",
  hoursLabel: "Seg a Sáb · 08h às 18h",
  addressHint: "Atendimento apenas com agendamento",
};

/** Horários base (slots de 1h). Serviços longos ocupam N slots. */
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

export const SERVICES: Service[] = [
  {
    id: "lavagem-detalhada",
    name: "Lavagem Detalhada",
    tagline: "Limpeza técnica de dentro pra fora",
    description:
      "Protocolo de lavagem profissional com atenção a detalhes que o lava-rápido comum não alcança.",
    durationHours: 2,
    priceFrom: 120,
    packages: [
      {
        id: "lav-ext",
        name: "Externa premium",
        description: "Pré-lavagem, shampoo neutro, secagem e pneus",
        included: true,
      },
      {
        id: "lav-int",
        name: "Interna completa",
        description: "Aspiração, painéis, vidros internos e portes",
        included: true,
      },
      {
        id: "lav-motor",
        name: "Compartimento do motor",
        description: "Limpeza e proteção do bay do motor",
        included: false,
      },
      {
        id: "lav-cera",
        name: "Cera de proteção",
        description: "Camada de brilho e proteção rápida",
        included: false,
      },
    ],
  },
  {
    id: "higienizacao",
    name: "Higienização Interna",
    tagline: "Conforto e cheiro de carro novo",
    description:
      "Remoção profunda de sujeira, óleos e odores em bancos, carpetes e teto.",
    durationHours: 3,
    priceFrom: 280,
    packages: [
      {
        id: "hig-bancos",
        name: "Bancos e laterais",
        description: "Extração e limpeza de tecidos ou couro",
        included: true,
      },
      {
        id: "hig-carpetes",
        name: "Carpetes e assoalho",
        description: "Lavagem com extratora e secagem controlada",
        included: true,
      },
      {
        id: "hig-teto",
        name: "Teto e colunas",
        description: "Limpeza delicada do forro interno",
        included: true,
      },
      {
        id: "hig-ozonio",
        name: "Ozônio / antiodor",
        description: "Neutralização de odores persistentes",
        included: false,
      },
    ],
  },
  {
    id: "polimento-vitrificacao",
    name: "Polimento & Vitrificação",
    tagline: "Brilho espelhado e proteção real",
    description:
      "Correção de pintura e proteção cerâmica para valorizar o visual e preservar a lataria.",
    durationHours: 4,
    priceFrom: 650,
    packages: [
      {
        id: "pol-correcao",
        name: "Correção de pintura",
        description: "Remoção de swirls e opacidade",
        included: true,
      },
      {
        id: "pol-vitri",
        name: "Vitrificação / cerâmica",
        description: "Proteção de longa duração e brilho intenso",
        included: true,
      },
      {
        id: "pol-plasticos",
        name: "Plásticos externos",
        description: "Revitalização de frisos e para-choques",
        included: false,
      },
      {
        id: "pol-vidros",
        name: "Tratamento de vidros",
        description: "Repelência e clareza nos vidros",
        included: false,
      },
    ],
  },
  {
    id: "insulfilm",
    name: "Insulfilm Window Blue",
    tagline: "Conforto térmico com garantia",
    description:
      "Películas profissionais para reduzir calor, proteger a pele e elevar o visual do veículo.",
    durationHours: 3,
    priceFrom: 890,
    packages: [
      {
        id: "ins-laterais",
        name: "Laterais + vigia",
        description: "Aplicação nas janelas laterais e traseira",
        included: true,
      },
      {
        id: "ins-parabrisas",
        name: "Para-brisa",
        description: "Filme no para-brisa com certificado",
        included: false,
      },
      {
        id: "ins-teto",
        name: "Teto solar",
        description: "Proteção e conforto no teto",
        included: false,
      },
      {
        id: "ins-garantia",
        name: "Certificado de garantia",
        description: "Documentação oficial do serviço",
        included: true,
      },
    ],
  },
];

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

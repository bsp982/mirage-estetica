import type { Appointment } from "./types";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Próximos N dias úteis (seg–sáb), a partir de from. */
function nextOpenDays(from: Date, count: number): string[] {
  const days: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    if (cursor.getDay() !== 0) {
      days.push(toISODate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Agenda fictícia sempre relativa a “hoje”, para a demo não parecer vazia. */
export function buildDemoAppointments(now = new Date()): Appointment[] {
  const [d0, d1, d2, d3, d4] = nextOpenDays(now, 5);
  const createdAt = now.toISOString();

  return [
    {
      id: "demo_apt_01",
      serviceId: "lavagem-detalhada",
      packageIds: ["lav-ext", "lav-int", "lav-cera"],
      date: d0,
      time: "09:00",
      customerName: "Ana Souza",
      customerPhone: "34991000001",
      customerCar: "Honda Civic prata",
      notes: "Cliente recorrente",
      createdAt,
    },
    {
      id: "demo_apt_02",
      serviceId: "higienizacao",
      packageIds: ["hig-bancos", "hig-carpetes", "hig-teto"],
      date: d0,
      time: "14:00",
      customerName: "Carlos Mendes",
      customerPhone: "34991000002",
      customerCar: "Jeep Compass preto",
      notes: "Criança no banco traseiro — atenção a odores",
      createdAt,
    },
    {
      id: "demo_apt_03",
      serviceId: "insulfilm",
      packageIds: ["ins-laterais", "ins-garantia"],
      date: d1,
      time: "10:00",
      customerName: "Fernanda Lima",
      customerPhone: "34991000003",
      customerCar: "BYD Dolphin cinza",
      notes: "",
      createdAt,
    },
    {
      id: "demo_apt_04",
      serviceId: "polimento-vitrificacao",
      packageIds: ["pol-correcao", "pol-vitri"],
      date: d2,
      time: "08:00",
      customerName: "Ricardo Alves",
      customerPhone: "34991000004",
      customerCar: "Mercedes C180 branca",
      notes: "Deixar o dia todo se necessário",
      createdAt,
    },
    {
      id: "demo_apt_05",
      serviceId: "lavagem-detalhada",
      packageIds: ["lav-ext", "lav-int", "lav-motor"],
      date: d3,
      time: "11:00",
      customerName: "Juliana Rocha",
      customerPhone: "34991000005",
      customerCar: "Toyota Corolla branco",
      notes: "",
      createdAt,
    },
    {
      id: "demo_apt_06",
      serviceId: "higienizacao",
      packageIds: ["hig-bancos", "hig-carpetes", "hig-teto", "hig-ozonio"],
      date: d4,
      time: "13:00",
      customerName: "Pedro Nogueira",
      customerPhone: "34991000006",
      customerCar: "VW T-Cross azul",
      notes: "Pet no carro",
      createdAt,
    },
  ];
}

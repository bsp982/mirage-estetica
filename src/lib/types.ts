export type AppointmentStatus =
  | "AGENDADO"
  | "CONFIRMADO"
  | "EM_EXECUCAO"
  | "AGUARDANDO_RETIRADA"
  | "FINALIZADO"
  | "CANCELADO"
  | "NAO_COMPARECEU";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "AGENDADO",
  "CONFIRMADO",
  "EM_EXECUCAO",
  "AGUARDANDO_RETIRADA",
  "FINALIZADO",
  "CANCELADO",
  "NAO_COMPARECEU",
];

export const STATUS_FLOW: Partial<
  Record<AppointmentStatus, AppointmentStatus>
> = {
  AGENDADO: "CONFIRMADO",
  CONFIRMADO: "EM_EXECUCAO",
  EM_EXECUCAO: "AGUARDANDO_RETIRADA",
  AGUARDANDO_RETIRADA: "FINALIZADO",
};

export type ServicePackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  included: boolean;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  durationHours: number;
  priceFrom: number;
  category?: string | null;
  imageUrl?: string | null;
  active?: boolean;
  packages: ServicePackage[];
};

export type CreateAppointmentInput = {
  serviceId: string;
  packageIds: string[];
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerCar: string;
  notes?: string;
  referralCode?: string;
};

/** Shape legado usado por slots/UI — mantido para compatibilidade. */
export type Appointment = {
  id: string;
  serviceId: string;
  packageIds: string[];
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerCar: string;
  notes: string;
  createdAt: string;
  status?: AppointmentStatus;
  price?: number | null;
};

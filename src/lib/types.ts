export type ServicePackage = {
  id: string;
  name: string;
  description: string;
  included: boolean;
};

export type Service = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  durationHours: number;
  priceFrom: number;
  packages: ServicePackage[];
};

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
};

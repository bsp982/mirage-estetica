import { prisma } from "./db";
import { normalizePhone, parseVehicleLabel } from "./phone";

/**
 * Clientes entram pelo agendamento público:
 * - telefone normalizado = chave única por empresa
 * - se já existe, vincula e atualiza nome/contato
 * - se não existe, cria
 * O gestor não precisa cadastrar clientes manualmente.
 */
export async function findOrCreateCustomer(input: {
  companyId: string;
  name: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
}) {
  const phone = normalizePhone(input.phone);
  if (!phone) {
    throw new Error("Telefone inválido");
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error("Nome é obrigatório");
  }

  const existing = await prisma.customer.findUnique({
    where: {
      companyId_phone: {
        companyId: input.companyId,
        phone,
      },
    },
  });

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: {
        name,
        email: input.email?.trim() || existing.email,
        whatsapp: input.whatsapp
          ? normalizePhone(input.whatsapp)
          : existing.whatsapp ?? phone,
      },
    });
  }

  return prisma.customer.create({
    data: {
      companyId: input.companyId,
      name,
      phone,
      whatsapp: input.whatsapp
        ? normalizePhone(input.whatsapp)
        : phone,
      email: input.email?.trim() || null,
    },
  });
}

/**
 * Veículo: tenta reutilizar pelo texto informado no mesmo cliente
 * (marca+modelo ou placa, se houver).
 */
export async function findOrCreateVehicle(input: {
  companyId: string;
  customerId: string;
  customerCar: string;
  plate?: string | null;
}) {
  const label = input.customerCar.trim();
  if (!label) {
    return null;
  }

  const parsed = parseVehicleLabel(label);
  const plate = input.plate ? input.plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : null;

  if (plate) {
    const byPlate = await prisma.vehicle.findFirst({
      where: {
        companyId: input.companyId,
        customerId: input.customerId,
        plate,
      },
    });
    if (byPlate) return byPlate;
  }

  const existing = await prisma.vehicle.findFirst({
    where: {
      companyId: input.companyId,
      customerId: input.customerId,
      brand: parsed.brand,
      model: parsed.model,
    },
  });
  if (existing) return existing;

  return prisma.vehicle.create({
    data: {
      companyId: input.companyId,
      customerId: input.customerId,
      brand: parsed.brand,
      model: parsed.model,
      year: parsed.year,
      color: parsed.color,
      plate,
      notes: label,
    },
  });
}

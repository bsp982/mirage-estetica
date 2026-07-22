import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCompanyFeatureCodes } from "@/lib/features";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyId = session.companyId;
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayCount,
    inProgress,
    awaitingPickup,
    finishedMonth,
    newCustomers,
    features,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { companyId, date: dateStr, status: { notIn: ["CANCELADO"] } },
    }),
    prisma.appointment.count({
      where: { companyId, status: "EM_EXECUCAO" },
    }),
    prisma.appointment.count({
      where: { companyId, status: "AGUARDANDO_RETIRADA" },
    }),
    prisma.appointment.count({
      where: {
        companyId,
        status: "FINALIZADO",
        updatedAt: { gte: monthStart },
      },
    }),
    prisma.customer.count({
      where: { companyId, createdAt: { gte: monthStart } },
    }),
    getCompanyFeatureCodes(companyId),
  ]);

  let monthRevenue = 0;
  if (features.has("FINANCIAL")) {
    const txs = await prisma.financialTransaction.findMany({
      where: {
        companyId,
        type: "INCOME",
        date: { gte: monthStart },
      },
    });
    monthRevenue = txs.reduce((s, t) => s + t.amount, 0);
  }

  return NextResponse.json({
    todayCount,
    inProgress,
    awaitingPickup,
    finishedMonth,
    newCustomers,
    monthRevenue,
    features: [...features],
  });
}

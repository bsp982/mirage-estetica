import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertFeature } from "@/lib/features";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    await assertFeature(session.companyId, "FINANCIAL");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Financeiro indisponível" },
      { status: 403 },
    );
  }

  const month = new URL(request.url).searchParams.get("month"); // YYYY-MM
  const now = new Date();
  const y = month ? Number(month.slice(0, 4)) : now.getFullYear();
  const m = month ? Number(month.slice(5, 7)) - 1 : now.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);

  const rows = await prisma.financialTransaction.findMany({
    where: {
      companyId: session.companyId,
      date: { gte: start, lt: end },
    },
    orderBy: { date: "desc" },
  });

  const income = rows
    .filter((r) => r.type === "INCOME")
    .reduce((s, r) => s + r.amount, 0);
  const expense = rows
    .filter((r) => r.type === "EXPENSE")
    .reduce((s, r) => s + r.amount, 0);

  return NextResponse.json({
    transactions: rows,
    summary: {
      income,
      expense,
      profit: income - expense,
      ticketMedio:
        rows.filter((r) => r.type === "INCOME").length > 0
          ? income / rows.filter((r) => r.type === "INCOME").length
          : 0,
    },
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    await assertFeature(session.companyId, "FINANCIAL");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Financeiro indisponível" },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    amount: number;
    date?: string;
  };

  const tx = await prisma.financialTransaction.create({
    data: {
      companyId: session.companyId,
      type: body.type,
      category: body.category,
      description: body.description,
      amount: Number(body.amount),
      date: body.date ? new Date(body.date) : new Date(),
    },
  });

  return NextResponse.json({ transaction: tx }, { status: 201 });
}

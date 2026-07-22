import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertFeature } from "@/lib/features";
import { getCompanyFeatureCodes } from "@/lib/features";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const features = [...(await getCompanyFeatureCodes(session.companyId))];

  try {
    await assertFeature(session.companyId, "REFERRAL");
  } catch {
    return NextResponse.json({ referrals: [], features, locked: true });
  }

  const referrals = await prisma.referral.findMany({
    where: { companyId: session.companyId },
    include: {
      referrer: true,
      referred: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ referrals, features, locked: false });
}

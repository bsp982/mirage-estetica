import { NextResponse } from "next/server";
import {
  sendPickupSoonNotifications,
  sendReturnCampaign,
} from "@/lib/communication";
import { createBirthdayCoupons } from "@/lib/loyalty";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const pickup = await sendPickupSoonNotifications();
  const birthdays = await createBirthdayCoupons();
  const returns = await sendReturnCampaign(60);

  return NextResponse.json({
    ok: true,
    pickupNotifications: pickup,
    birthdayCoupons: birthdays,
    returnCampaigns: returns,
  });
}

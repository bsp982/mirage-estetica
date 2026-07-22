import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FinanceiroPanel } from "@/components/financeiro-panel";

export default async function FinanceiroPage() {
  const session = await getSession();
  if (!session) redirect("/gestor/login");
  return <FinanceiroPanel />;
}

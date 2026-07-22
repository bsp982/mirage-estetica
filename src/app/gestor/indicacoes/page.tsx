import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { IndicacoesPanel } from "@/components/indicacoes-panel";

export default async function IndicacoesPage() {
  const session = await getSession();
  if (!session) redirect("/gestor/login");
  return <IndicacoesPanel />;
}

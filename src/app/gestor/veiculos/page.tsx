import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { VeiculosPanel } from "@/components/veiculos-panel";

export default async function VeiculosPage() {
  const session = await getSession();
  if (!session) redirect("/gestor/login");
  return <VeiculosPanel />;
}

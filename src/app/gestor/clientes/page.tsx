import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ClientesPanel } from "@/components/clientes-panel";

export default async function ClientesPage() {
  const session = await getSession();
  if (!session) redirect("/gestor/login");
  return <ClientesPanel />;
}

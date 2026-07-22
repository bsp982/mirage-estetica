import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ServicosPanel } from "@/components/servicos-panel";

export default async function ServicosPage() {
  const session = await getSession();
  if (!session) redirect("/gestor/login");
  return <ServicosPanel />;
}

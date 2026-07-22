import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ManagerAgenda } from "@/components/manager-agenda";

export default async function AgendaPage() {
  const session = await getSession();
  if (!session) redirect("/gestor/login");
  return <ManagerAgenda />;
}

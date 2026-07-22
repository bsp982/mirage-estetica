import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ConfigPanel } from "@/components/config-panel";

export default async function ConfigPage() {
  const session = await getSession();
  if (!session) redirect("/gestor/login");
  return <ConfigPanel />;
}

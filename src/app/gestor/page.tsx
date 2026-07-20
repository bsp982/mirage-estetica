import { redirect } from "next/navigation";
import Link from "next/link";
import { isManagerAuthenticated } from "@/lib/auth";
import { ManagerAgenda } from "@/components/manager-agenda";

export default async function GestorPage() {
  const ok = await isManagerAuthenticated();
  if (!ok) {
    redirect("/gestor/login");
  }

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_#0b2a8f_0%,_#050914_55%)]">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <Link href="/" className="text-xs text-white/50 hover:text-white">
          ← Site público
        </Link>
        <div className="mt-6">
          <ManagerAgenda />
        </div>
      </div>
    </div>
  );
}

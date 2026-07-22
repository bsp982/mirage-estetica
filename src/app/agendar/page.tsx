import { redirect } from "next/navigation";

/** Agendamento da raiz aponta para a demo pública do tenant. */
export default function AgendarRedirectPage() {
  redirect("/s/estetica-mvp#agendar");
}

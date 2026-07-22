import { PlatformHeader } from "@/components/platform-header";
import { PlatformFooter } from "@/components/platform-footer";

export default function TermosPage() {
  return (
    <div className="flex min-h-full flex-col">
      <PlatformHeader />
      <main className="mx-auto max-w-3xl flex-1 px-5 py-16 text-white/80">
        <h1 className="font-display text-5xl text-white">Termos de uso</h1>
        <p className="mt-2 text-sm text-white/45">Última atualização: jul/2026</p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed">
          <p>
            O Estética CRM é uma plataforma SaaS para estéticas automotivas
            publicarem site, receberem agendamentos e gerenciarem a agenda.
          </p>
          <p>
            O plano FREE é oferecido sem cobrança, podendo ter limites de
            recursos. Planos pagos desbloqueiam funcionalidades adicionais.
          </p>
          <p>
            Você é responsável pelos dados dos seus clientes e pelo conteúdo
            publicado no site da sua estética. Não utilize a plataforma para
            fins ilegais.
          </p>
          <p>
            Podemos alterar planos, limites e estes termos com aviso prévio
            razoável. Em caso de dúvida, entre em contato pelo canal de suporte
            indicado no site.
          </p>
        </div>
      </main>
      <PlatformFooter />
    </div>
  );
}

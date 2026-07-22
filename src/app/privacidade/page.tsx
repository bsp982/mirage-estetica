import { PlatformHeader } from "@/components/platform-header";
import { PlatformFooter } from "@/components/platform-footer";

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-full flex-col">
      <PlatformHeader />
      <main className="mx-auto max-w-3xl flex-1 px-5 py-16 text-white/80">
        <h1 className="font-display text-5xl text-white">Privacidade</h1>
        <p className="mt-2 text-sm text-white/45">Última atualização: jul/2026</p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed">
          <p>
            Coletamos dados necessários para operar a plataforma: conta do
            gestor, dados da estética e informações de agendamento fornecidas
            pelos clientes finais.
          </p>
          <p>
            Cada estética (tenant) tem seus dados isolados por empresa. Não
            vendemos bases de clientes.
          </p>
          <p>
            Dados são armazenados em infraestrutura de banco gerenciada
            (Supabase/Postgres). Você pode solicitar exclusão da conta entrando
            em contato com o suporte.
          </p>
          <p>
            Ao usar o agendamento, o cliente final informa nome e telefone para
            a estética prestadora do serviço — esses dados pertencem à relação
            entre cliente e estética.
          </p>
        </div>
      </main>
      <PlatformFooter />
    </div>
  );
}

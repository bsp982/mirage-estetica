# Setup Supabase (CRM)

## 1. Criar projeto

1. Acesse https://supabase.com e crie um projeto.
2. Vá em **Project Settings → Database**.
3. Copie:
   - **Connection string** (URI) do **Session mode** ou **Transaction** (pooler, porta `6543`) → `DATABASE_URL`
   - **Direct connection** (porta `5432`) → `DIRECT_URL`

## 2. Variáveis locais

```bash
cp .env.example .env
```

Preencha no `.env`:

```env
DATABASE_URL="postgresql://postgres.xxxx:SENHA@aws-0-....pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:SENHA@aws-0-....pooler.supabase.com:5432/postgres"
SESSION_SECRET="um-segredo-longo-aleatorio-min-16-chars"
DEFAULT_COMPANY_SLUG="estetica-mvp"
CRON_SECRET="segredo-do-cron"
```

> Não commite o `.env`. O arquivo `.env.example` é o modelo.

## 3. Aplicar schema + seed

```bash
npm run db:setup
```

Isso roda `prisma db push` no Postgres do Supabase e popula planos, empresa demo, serviços e usuário gestor.

## 4. Login demo

- E-mail: `admin@estetica.local`
- Senha: `admin`
- Site tenant: `/s/estetica-mvp`

## Fluxo de cliente (sem cadastro manual)

1. Pessoa agenda no site (nome + WhatsApp + veículo).
2. Sistema normaliza o telefone e **busca** `Customer` por `(company_id, phone)`.
3. Se existir → **vincula** e atualiza nome/contato.
4. Se não existir → **cria** cliente + veículo.
5. Gestor só consulta/edita em `/gestor/clientes`.

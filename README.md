# Mirage Estética Automotiva — Agendamentos

Site de agendamento online para a Mirage Estética Automotiva (Uberlândia-MG).

## Funcionalidades (MVP)

- **Cliente:** landing + fluxo de agendamento (serviço → pacotes → horário → dados)
- **Gestor:** login e agenda com detalhes dos clientes
- **Privacidade:** horários ocupados ficam bloqueados sem exibir nomes de outros clientes
- **Sem banco de dados:** persistência em `data/appointments.json`
- **Login gestor:** `admin` / `admin`

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

- Agendar: `/agendar`
- Gestor: `/gestor/login`

## Próximos passos sugeridos

- Banco de dados (Postgres/Neon)
- Integração com Google Agenda
- Deploy na Vercel (com storage persistente)

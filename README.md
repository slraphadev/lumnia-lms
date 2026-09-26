<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg">
    <img src=".github/assets/logo-light.svg" alt="Lumnia" width="280">
  </picture>
</p>

<p align="center">Plataforma de ensino online (LMS/MOOC) white label.</p>

> **Estado atual: v0.1, MVP interno.** Uma instância atende uma única organização, com dois perfis (Aluno e Professor), cursos no formato MOOC organizados em módulos e aulas, vídeos por link do YouTube ou do Vimeo, matrícula em um clique e registro de progresso. A interface ainda é funcional, sem o design system aplicado por completo.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) com React 19 e TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- PostgreSQL 18 com [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://www.better-auth.com) para autenticação
- [Vitest](https://vitest.dev) para testes

## Requisitos

- Node.js 24 LTS
- [pnpm](https://pnpm.io) 11
- Docker (para o Postgres local)

## Como rodar localmente

```bash
pnpm install
cp .env.example .env        # depois gere um BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:up                  # sobe o Postgres no Docker
pnpm db:migrate             # cria as tabelas
pnpm db:seed                # opcional: contas e curso de exemplo
pnpm dev
```

A aplicação fica em http://localhost:3000. O seed cria as contas `professor@lumnia.dev` e `aluno@lumnia.dev`, ambas com a senha `lumnia-dev-123`.

## Scripts

| Script | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` / `pnpm start` | Build e servidor de produção |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | ESLint, checagem de tipos e testes |
| `pnpm db:up` | Sobe o Postgres (docker compose) |
| `pnpm db:generate` | Gera uma migração a partir de `src/db/schema` |
| `pnpm db:migrate` | Aplica as migrações pendentes |
| `pnpm db:studio` | Abre o Drizzle Studio |
| `pnpm db:seed` | Dados de exemplo para desenvolvimento |
| `pnpm auth:generate` | Regenera `src/db/schema/auth.ts` a partir da configuração do Better Auth |

## Fonte

A fonte padrão do repositório é a [Outfit](https://fonts.google.com/specimen/Outfit) (licença OFL). A fonte da marca, [Chillax](https://www.fontshare.com/fonts/chillax), é opcional: a licença do Fontshare não permite redistribuí-la, então ela não faz parte do repositório. Para usá-la, baixe o pacote no Fontshare e informe o caminho do `Chillax-Variable.woff2` em `CHILLAX_WOFF2_PATH` no `.env`. O script `scripts/setup-fonts.mjs` roda antes do `dev` e do `build` e cuida do resto.

## Estrutura

```
src/
  app/            rotas (App Router)
    (auth)/       cadastro, login e logout
    cursos/       catálogo, página do curso e aulas (aluno)
    meus-cursos/  cursos matriculados e progresso
    professor/    painel do professor: cursos, módulos e aulas
  components/     componentes de interface
  db/             conexão e schema do Drizzle
  lib/            autenticação, sessão, consultas e utilitários
drizzle/          migrações SQL
scripts/          setup de fontes e seed
```

## Licença

Todos os direitos reservados. Veja [LICENSE.md](LICENSE.md). O código está publicado para consulta, mas nenhum direito de uso, cópia, modificação ou distribuição é concedido.

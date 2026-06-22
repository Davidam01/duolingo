# Duolingo — Language Learning App

Full-stack Next.js application for language learning with gamification (XP, streaks, leaderboards).

## Tech Stack

- **Framework**: Next.js 16 (App Router) — see `node_modules/next/dist/docs/` for API changes
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (beta) with Prisma adapter
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint (flat config) + Prettier
- **Package manager**: npm

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Auth pages group (login, register)
│   ├── learn/                  # Main lesson experience
│   ├── leaderboard/            # Weekly rankings
│   ├── profile/                # User stats, achievements
│   └── api/                    # Route handlers (auth, lessons, progress)
├── components/                 # Reusable UI components
├── lib/                        # Prisma client, utils, auth config
└── styles/                     # Global styles
prisma/
└── schema.prisma               # Database models
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (Turbopack) |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Run Jest tests |
| `npm run format` | Prettier format |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to DB |
| `npx prisma studio` | Open DB browser |

## Code Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- **Components**: PascalCase, one component per file, named exports
- **API routes**: Named exports for HTTP methods (GET, POST, PUT, DELETE)
- **Async request APIs**: `params` and `searchParams` are Promises — always await
- **Imports**: Use `@/` alias for `src/`
- **Proxy**: Use `proxy.ts` (NOT middleware.ts) — Next.js 16 breaking change

## Workflow

1. Create a new branch per task: `feat/description`, `fix/description`
2. Make commits following Conventional Commits
3. Push and open a Pull Request to `main`
4. CI must pass (lint → typecheck → test → build) before merge
5. Merge only when CI is green

## Agents & Skills

This project uses the `frontend-design` skill for UI development. Subagents available:

| Invocation | Purpose |
|-----------|---------|
| `@redactor` | Copywriting: microcopias, textos de ejercicios, feedback gamificado |
| `@seo` | SEO técnico: meta tags, Open Graph, structured data, sitemaps |
| `@revisor` | Code review: seguridad, tipos, buenas prácticas |
| `@accesibilidad` | Accesibilidad: WCAG, ARIA, contraste, teclado |
| `@db-designer` | Modelos Prisma, migraciones, consultas optimizadas |
| `@ui-designer` | UI con el skill `frontend-design`, componentes e identidad visual |

## Next.js 16 Migration Notes

- Middleware → `proxy.ts` (export `proxy` function, Node.js runtime)
- `params` and `searchParams` are Promises — must `await`
- `cookies()`, `headers()` are fully async
- No `next lint` — use ESLint CLI directly
- Turbopack is default for dev and build
- Parallel routes require explicit `default.js` files
- `revalidateTag(tag, profile)` requires 2nd argument
- Use `next/image` (not `next/legacy/image`)
- Node 20.9+ required

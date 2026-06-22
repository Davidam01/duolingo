# Duolingo — Language Learning App

Full-stack Next.js application for language learning with gamification (XP, streaks, leaderboards).

Built with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **NextAuth.js**.

## Getting Started

```bash
npm install
npx prisma generate
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run tests |
| `npm run format` | Prettier format |

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5
- **Testing**: Jest + React Testing Library

## Project Structure

```
src/
├── app/          # App Router pages and API routes
├── components/   # Reusable UI components
├── lib/          # Prisma client, auth config, utils
└── styles/       # Global styles
prisma/
└── schema.prisma # Database models
```

## Workflow

1. Create a branch: `feat/description` or `fix/description`
2. Commit using Conventional Commits
3. Open a Pull Request to `main`
4. Wait for CI (lint → typecheck → test → build)
5. Merge when green

# Duolingo — Aplicación de Aprendizaje de Idiomas

Aplicación full-stack Next.js para el aprendizaje de idiomas con gamificación (XP, rachas, clasificaciones).

Construida con **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, **Prisma ORM** y **NextAuth.js**.

## Primeros Pasos

```bash
npm install
npx prisma generate
npm run dev
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run lint` | Verificación ESLint |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run test` | Ejecutar tests |
| `npm run format` | Formateo con Prettier |

## Stack

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript (estricto)
- **Estilos**: Tailwind CSS v4
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js v5
- **Tests**: Jest + React Testing Library

## Estructura del Proyecto

```
src/
├── app/          # Páginas y rutas API de App Router
├── components/   # Componentes UI reutilizables
├── lib/          # Cliente Prisma, configuración de auth, utilidades
└── styles/       # Estilos globales
prisma/
└── schema.prisma # Modelos de base de datos
```

## Flujo de Trabajo

1. Crear una rama: `feat/descripcion` o `fix/descripcion`
2. Hacer commits usando Commits Convencionales
3. Abrir un Pull Request a `main`
4. Esperar al CI (lint → typecheck → test → build)
5. Hacer merge cuando esté en verde

# Duolingo — Aplicación de Aprendizaje de Idiomas

Aplicación full-stack Next.js para el aprendizaje de idiomas con gamificación (XP, rachas, clasificaciones).

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router) — consulta `node_modules/next/dist/docs/` para cambios de API
- **Lenguaje**: TypeScript (modo estricto)
- **Estilos**: Tailwind CSS v4
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js v5 (beta) con adaptador Prisma
- **Tests**: Jest + React Testing Library
- **Linting**: ESLint (config plana) + Prettier
- **Gestor de paquetes**: npm

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/                 # Grupo de páginas de autenticación (login, registro)
│   ├── learn/                  # Experiencia principal de lecciones
│   ├── leaderboard/            # Clasificaciones semanales
│   ├── profile/                # Estadísticas y logros del usuario
│   └── api/                    # Manejadores de ruta (auth, lecciones, progreso)
├── components/                 # Componentes UI reutilizables
├── lib/                        # Cliente Prisma, utilidades, configuración de auth
└── styles/                     # Estilos globales
prisma/
└── schema.prisma               # Modelos de base de datos
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilación de producción (Turbopack) |
| `npm run lint` | Verificación ESLint |
| `npm run typecheck` | Verificación de tipos TypeScript (`tsc --noEmit`) |
| `npm run test` | Ejecutar tests Jest |
| `npm run format` | Formateo con Prettier |
| `npx prisma generate` | Generar cliente Prisma |
| `npx prisma db push` | Sincronizar esquema con la BD |
| `npx prisma studio` | Abrir navegador de BD |

## Convenciones de Código

- **Commits**: Commits Convencionales (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- **Componentes**: PascalCase, un componente por archivo, exportaciones nombradas
- **Rutas API**: Exportaciones nombradas para métodos HTTP (GET, POST, PUT, DELETE)
- **APIs asíncronas**: `params` y `searchParams` son Promesas — usar siempre `await`
- **Importaciones**: Usar el alias `@/` para `src/`
- **Proxy**: Usar `proxy.ts` (NO middleware.ts) — cambio en Next.js 16

## Flujo de Trabajo

1. Crear una rama nueva por cada tarea: `feat/descripcion`, `fix/descripcion`
2. Hacer commits siguiendo Commits Convencionales
3. Hacer push y abrir un Pull Request a `main`
4. El CI debe pasar (lint → typecheck → test → build) antes del merge
5. Hacer merge solo cuando el CI esté en verde

## Agentes y Skills

Este proyecto usa el skill `frontend-design` para desarrollo de UI. Subagentes disponibles:

| Invocación | Propósito |
|-----------|-----------|
| `@redactor` | Copywriting: microcopias, textos de ejercicios, feedback gamificado |
| `@seo` | SEO técnico: meta tags, Open Graph, datos estructurados, sitemaps |
| `@revisor` | Code review: seguridad, tipos, buenas prácticas |
| `@accesibilidad` | Accesibilidad: WCAG, ARIA, contraste, teclado |
| `@db-designer` | Modelos Prisma, migraciones, consultas optimizadas |
| `@ui-designer` | UI con el skill `frontend-design`, componentes e identidad visual |

## Notas de Migración a Next.js 16

- Middleware → `proxy.ts` (exportar función `proxy`, runtime Node.js)
- `params` y `searchParams` son Promesas — usar `await`
- `cookies()`, `headers()` son completamente asíncronas
- No existe `next lint` — usar ESLint CLI directamente
- Turbopack es el predeterminado para dev y build
- Las rutas paralelas requieren archivos `default.js` explícitos
- `revalidateTag(tag, profile)` requiere un segundo argumento
- Usar `next/image` (no `next/legacy/image`)
- Node 20.9+ requerido

# Duolingo — Aplicación de Aprendizaje de Idiomas

Aplicación full-stack Next.js para el aprendizaje de idiomas con gamificación (XP, rachas, clasificaciones, logros).

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router) — consulta `node_modules/next/dist/docs/` para cambios de API
- **Lenguaje**: TypeScript (modo estricto)
- **Estilos**: Tailwind CSS v4
- **Base de datos**: SQLite + Prisma ORM (v7)
- **Autenticación**: NextAuth.js v5 (beta) con adaptador Prisma
- **Tests**: Jest + React Testing Library
- **Linting**: ESLint (config plana) + Prettier
- **Gestor de paquetes**: npm

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/                 # Grupo de páginas de autenticación (login, registro)
│   ├── learn/                  # Experiencia principal de lecciones (ruta vertical con nodos)
│   ├── leaderboard/            # Clasificaciones semanales
│   ├── profile/                # Estadísticas y logros del usuario (galería de badges)
│   ├── onboarding/language/    # Selección de idioma al primer inicio
│   ├── api/
│   │   ├── auth/               # Manejadores de auth (login, registro)
│   │   ├── lessons/            # Lecciones y progreso
│   │   ├── progress/           # Progreso de ejercicios
│   │   ├── leaderboard/        # Clasificaciones
│   │   ├── achievements/       # Verificación y desbloqueo de logros
│   │   └── onboarding/         # Guardar idioma seleccionado
│   └── lessons/[id]/           # Página de lección con flujo de ejercicios
├── components/
│   ├── auth-form.tsx           # Formulario login/registro
│   ├── navbar.tsx              # Server component (carga sesión)
│   ├── navbar-client.tsx       # Nav responsive: top desktop, bottom tabs mobile
│   ├── lesson-flow.tsx         # Flujo de ejercicios con progreso
│   └── exercise-card.tsx       # Componente único de ejercicio (3 tipos)
├── lib/
│   ├── prisma.ts               # Cliente Prisma con adapter better-sqlite3
│   ├── auth.ts                 # Configuración NextAuth (Credentials + Google)
│   └── seo.ts                  # SEO config español
├── types/
│   └── next-auth.d.ts          # Tipos extendidos de sesión
└── proxy.ts                    # Route protection + redirect onboarding
prisma/
├── schema.prisma               # Modelos de base de datos
├── seed.ts                     # Seed con curso, 18 logros, ejercicios
└── config.ts                   # Configuración Prisma v7
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
| `npm run prisma:seed` | Poblar BD con datos de ejemplo |
| `npx prisma generate` | Generar cliente Prisma |
| `npx prisma db push` | Sincronizar esquema con la BD |
| `npx prisma studio` | Abrir navegador de BD |

## Sistema de Diseño (Duolingo)

### Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#58CC02` | Verde Duolingo — CTAs, nodos activos, aciertos |
| `primary-hover` | `#46A302` | Hover de botones primarios |
| `secondary` | `#1CB0F6` | Azul — enlaces, racha |
| `accent` | `#FF9600` | Naranja — XP, medallas |
| `error` | `#FF4B4B` | Rojo — errores, respuestas incorrectas |
| `success` | `#00A884` | Teal — respuestas correctas, lecciones completadas |
| `purple` | `#CE82FF` | Púrpura — logros, ligas |
| `yellow` | `#FFC800` | Amarillo — celebraciones XP |
| `text` | `#3C3C3C` | Casi negro — texto principal |
| `text-muted` | `#777777` | Gris — texto secundario |
| `surface` | `#FFFFFF` | Blanco — fondos de tarjeta |
| `border` | `#E5E5E5` | Gris claro — bordes |

### Tipografía
- **Display**: Fredoka (Google Font) — lowercase, bold para títulos
- **Body**: Geist Sans — UI y texto general
- **Botones**: uppercase, bold, tracking-wide, shadow 3D (`shadow-[0_4px_0_#58A700]`)

### Patrones UI
- **Botones 3D**: sombra inferior que se reduce en hover/active (efecto físico)
- **Ruta de aprendizaje**: scroll vertical con nodos conectados por línea. Nodo activo pulsa, completado es dorado, bloqueado es gris
- **Navbar**: top bar en desktop, bottom tabs en móvil (🦉 Aprender / 🏆 Clasificación / 👤 Perfil / 🚪 Salir)
- **ExerciseCard**: feedback inmediato ✅/❌ + respuesta correcta, delay 600ms antes de avanzar
- **Logros**: galería en grid 2-columnas, desbloqueados a color, bloqueados en gris con candado

### Animaciones
| Nombre | Duración | Uso |
|--------|----------|-----|
| `fade-in-up` | 0.4s | Entrada de componentes |
| `scale-in` | 0.3s | Pantalla de resultado |
| `bounce-in` | 0.5s | Íconos de celebración |
| `xp-float` | 1.2s | XP flotante al ganar |
| `streak-fire` | 2s | Pulso de racha (infinite) |

## Convenciones de Código

- **Commits**: Commits Convencionales (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- **Componentes**: PascalCase, un componente por archivo, exportaciones nombradas
- **Rutas API**: Exportaciones nombradas para métodos HTTP (GET, POST, PUT, DELETE)
- **APIs asíncronas**: `params` y `searchParams` son Promesas — usar siempre `await`
- **Importaciones**: Usar el alias `@/` para `src/`
- **Proxy**: Usar `proxy.ts` (NO middleware.ts) — cambio en Next.js 16
- **Sesión extendida**: `session.user.id` y `session.user.onboardingComplete` disponibles tras tipado en `src/types/next-auth.d.ts`
- **ExerciseCard**: unifica MultipleChoice, FillBlank y Translation. Usar `key={exercise.id}` para evitar estado atascado
- **Driver adapter**: `@prisma/adapter-better-sqlite3` para SQLite en Prisma 7

## Flujo de Onboarding

1. Usuario se registra → `onboardingComplete = false`
2. Proxy redirige a `/onboarding/language` si no ha completado onboarding
3. Usuario selecciona idioma → `POST /api/onboarding/language` → redirige a `/learn`
4. `onboardingComplete = true`, proxy ya no redirige

## Sistema de Logros

18 logros en 4 categorías verificados automáticamente al completar lección (`POST /api/achievements`):

| Tipo | Ejemplos |
|------|----------|
| `STREAK` | 3, 7, 30, 100, 365 días |
| `XP_MILESTONE` | 100, 500, 1000, 5000, 10000 XP |
| `LESSONS_COMPLETED` | 1, 5, 10, 25, 50 lecciones |
| `PERFECT_LESSON` | 1, 5, 10 lecciones sin errores |

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

## Notas de Prisma 7

- `datasource db { url }` eliminado del schema → se configura en `prisma.config.ts` con `defineConfig` + `env()`
- Requiere driver adapters: `@prisma/adapter-better-sqlite3` con SQLite local
- `PrismaClient` necesita `{ adapter }` en el constructor
- SQLite para desarrollo local; cambiar a PostgreSQL en producción

## Notas de NextAuth v5

- `signOut` se importa de `next-auth/react` para componentes cliente
- Sesión usa estrategia JWT con `PrismaAdapter`
- `authorize` en Credentials provider lanza errores (no retorna null) para propagar al cliente
- Tipos extendidos en `src/types/next-auth.d.ts` para `onboardingComplete`

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
│   ├── page.tsx                # Landing (no auth) o dashboard con stats (auth)
│   ├── learn/                  # Experiencia principal de lecciones (ruta vertical con nodos)
│   ├── leaderboard/            # Clasificaciones globales
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
│   ├── achievement-notification.tsx # Overlay de logro desbloqueado + sonido
│   └── exercise-card.tsx       # Componente único de ejercicio (3 tipos)
├── __tests__/
│   └── api/
│       └── api-integration.test.ts  # Tests de integración con BD SQLite real
├── lib/
│   ├── prisma.ts               # Cliente Prisma con adapter better-sqlite3
│   ├── auth.ts                 # Configuración NextAuth (Credentials + Google)
│   ├── achievements.ts         # Lógica de verificación de logros
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
| `npm run test` | Ejecutar todos los tests (unit + integración) |
| `npx jest src/components/` | Solo tests unitarios de componentes |
| `npx jest src/__tests__/` | Solo tests de integración con BD |
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
| `text` | `#1A1A1A` | Casi negro — texto principal |
| `text-muted` | `#888888` | Gris — texto secundario |
| `background` | `#FFFFFF` | Fondo general de la app (blanco sólido) |
| `surface` | `#FFFFFF` | Blanco — fondos de tarjeta y navbar |
| `border` | `#E8E8E8` | Gris claro — bordes de cards |

### Tipografía
- **Display**: Fredoka (Google Font) — lowercase, bold para títulos
- **Body**: Geist Sans — UI y texto general
- **Botones**: uppercase, bold, tracking-wide, shadow 3D (`shadow-[0_4px_0_#58A700]`)

### Patrones UI
- **Botones 3D**: sombra inferior que se reduce en hover/active (efecto físico)
- **Ruta de aprendizaje**: scroll vertical con nodos conectados por línea. Nodo activo pulsa, completado es dorado, bloqueado es gris
- **Navbar**: top bar en desktop, bottom tabs en móvil (🏠 Inicio / 🦉 Aprender / 🏆 Clasificación / 👤 Perfil / 🚪 Salir)
- **ExerciseCard**: feedback inmediato ✅/❌ + respuesta correcta. Acierto → auto-avance 600ms. Error → botón "siguiente" manual.
- **ExerciseCard — tipos**: `MULTIPLE_CHOICE` (opciones vertical), `TRANSLATION` (cursiva + label), `FILL_BLANK` (grid 2 col), `LISTENING` (botón play + TTS), `ORDERING` (chips de palabras arrastrables), `FREE_FORM` (input de texto + Enter).
- **Dificultad**: Cada ejercicio tiene `difficulty` (`BEGINNER`/`INTERMEDIATE`/`ADVANCED`). Badge visible en ExerciseCard (★/★★/★★★). En /learn, cada lección muestra su rango de dificultad. XP multiplicado por factor de dificultad (×1, ×1.5, ×2).
- **Comparación**: Normalizada con `toLowerCase().trim()` en `lesson-flow.tsx` para ORDERING y FREE_FORM.
- **Logros**: galería en grid 2-columnas, desbloqueados a color, bloqueados en gris con candado

### Animaciones
| Nombre | Duración | Uso |
|--------|----------|-----|
| `fade-in-up` | 0.4s | Entrada de componentes |
| `scale-in` | 0.3s | Pantalla de resultado |
| `bounce-in` | 0.5s | Íconos de celebración (solo landing) |
| `streak-fire` | 2s | Pulso de racha (infinite, solo dashboard) |
| `slide-up` | 0.3s | Feedback de acierto/error en ExerciseCard |
| `bounce-in` | 0.5s | ✅/❌ iconos en opciones |

## Tests

### Tests Unitarios (59 tests)

Ubicación: `src/components/__tests__/`

| Archivo | Descripción |
|---------|-------------|
| `auth-form.test.tsx` | Login, register, errores, Google sign-in, navegación post-login |
| `exercise-card.test.tsx` | 3 tipos de ejercicio, feedback correcto/incorrecto, estados |
| `language-changer.test.tsx` | Selector de idioma, toggle, llamada API, loading/error |
| `lesson-flow.test.tsx` | Flujo de lección, progreso, pantalla de completado |
| `navbar-client.test.tsx` | Sesión/no sesión, XP counter, logout, enlaces activos |

Entorno: `jsdom` — no requiere base de datos.

### Tests de Integración (28 tests)

Ubicación: `src/__tests__/api/api-integration.test.ts`

Usan una base de datos SQLite real (`test.db`) que se crea y destruye automáticamente.

| Ruta | Tests | Cobertura |
|------|-------|-----------|
| `GET /api/lessons` | 4 | 401 sin auth, orden ASC, count exercises, section/course info |
| `POST /api/lessons/complete` | 6 | 401, XP 100%, XP parcial, streak, achievements sincronos, 500 invalid body |
| `GET /api/progress` | 3 | 401, empty array, entries con exercise info |
| `POST /api/progress` | 4 | 401, 400 sin exerciseId, create 201, no duplicate (200) |
| `POST /api/achievements` | 5 | 401, unlock thresholds, no re-unlock, details, empty |
| `GET /api/leaderboard` | 6 | 401, sorted desc, isCurrentUser, rank/xp/count, 50 limit, dates |

Entorno: `@jest-environment node` — usa `Request`/`Response` globales de Node 20+.

**Setup automático**: El primer test ejecuta `npx prisma db push --accept-data-loss` (tarda ~3-5s)
para crear `test.db` con el esquema. Se limpia al finalizar (`afterAll`).

**Aislamiento**: `beforeEach` resetea las stats del usuario de test (xp, streak, lessonsCompleted,
perfectLessons) y limpia progress/achievements para evitar contaminación entre tests.

**Achievements sincronos**: `verifyAchievements` se ejecuta con `await` dentro de
`POST /api/lessons/complete` y los logros desbloqueados se devuelven en la respuesta.
Los tests verifican `unlocked` directamente en el body del response.

**`test.db`** está en `.gitignore`. Si un test falla y no se limpia, borrar manualmente:
```bash
rm -f test.db test.db-journal test.db-wal test.db-shm
```

### CI Pipeline

El workflow de GitHub Actions (`ci.yml`) ejecuta en orden:

1. `npm ci` — instalar dependencias
2. `npx prisma generate` — generar cliente Prisma
3. `npm run lint` — ESLint
4. `npm run typecheck` — TypeScript
5. **Unit tests** (`npx jest src/components/`) — feedback rápido
6. **Integration tests** (`npx jest src/__tests__/`) — validación con BD real
7. `npm run build` — compilación Next.js

## Convenciones de Código

- **Commits**: Commits Convencionales (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- **Componentes**: PascalCase, un componente por archivo, exportaciones nombradas
- **Rutas API**: Exportaciones nombradas para métodos HTTP (GET, POST, PUT, DELETE)
- **APIs asíncronas**: `params` y `searchParams` son Promesas — usar siempre `await`
- **Importaciones**: Usar el alias `@/` para `src/`
- **Proxy**: Usar `proxy.ts` (NO middleware.ts) — cambio en Next.js 16
- **Sesión extendida**: `session.user.id` y `session.user.onboardingComplete` disponibles tras tipado en `src/types/next-auth.d.ts`
- **ExerciseCard**: unifica MultipleChoice, FillBlank, Translation, Listening, Ordering y FreeForm. Usar `key={exercise.id}` para evitar estado atascado
- **Driver adapter**: `@prisma/adapter-better-sqlite3` para SQLite en Prisma 7
- **Router**: NO usar `router.refresh()` después de `router.push()` — causa race condition en RSC (Next.js 16)
- **Proxy publicPaths**: incluir siempre `/api/ruta` además de `/ruta` para APIs que necesiten bypass
- **JWT callback**: siempre con try/catch, NO hardcodear valores por defecto en catch (mantener el anterior)
- **better-sqlite3**: requiere `npm approve-scripts better-sqlite3` tras instalar (native addon)
- **Sistema de XP**: Solo `POST /api/lessons/complete` otorga XP. `POST /api/progress` solo guarda progreso individual (sin XP) para evitar doble acumulación.
- **Rachas (streak)**: Se actualizan en `POST /api/lessons/complete`. Si la última actividad fue el día anterior → streak +1. Si fue hoy → se mantiene. Si hubo un gap >1 día → se reinicia a 1.
- **Lecciones completadas**: `user.lessonsCompleted` se incrementa en cada llamada exitosa a `/api/lessons/complete`. `user.perfectLessons` se incrementa solo si `correct === total`.
- **Verificación de logros**: `verifyAchievements` se ejecuta con `await` dentro de `POST /api/lessons/complete`. Los logros desbloqueados se devuelven en el response (`{ xp, unlocked }`). El cliente (`lesson-client.tsx`) muestra una notificación con sonido vía `AchievementNotification`.
- **Leaderboard**: Es global (XP total), no semanal. El modelo `Leaderboard` con `weekStart`/`weekEnd` existe pero no se usa actualmente.

## Flujo de Onboarding

1. Usuario se registra → `onboardingComplete = false`
2. Proxy redirige a `/onboarding/language` si no ha completado onboarding
3. Usuario selecciona idioma → `POST /api/onboarding/language` → redirige a `/` (home dashboard)
4. `onboardingComplete = true`, proxy ya no redirige

## Sistema de Logros

18 logros en 4 categorías verificados automáticamente al completar lección. La verificación se dispara desde `POST /api/lessons/complete` mediante un fetch interno a `POST /api/achievements` (envuelto en try/catch, no bloqueante):

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

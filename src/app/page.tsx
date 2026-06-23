import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-background">
        <div className="max-w-sm w-full text-center space-y-10">
          <div className="space-y-6">
            <div className="text-7xl animate-bounce-in">🦉</div>
            <h1 className="text-4xl font-bold font-display text-text leading-tight">
              aprende un idioma{" "}
              <span className="text-primary">gratis</span>
            </h1>
            <p className="text-base text-text-muted leading-relaxed max-w-xs mx-auto">
              Lecciones divertidas, efectivas y completamente gratis.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "10M+", label: "estudiantes" },
              { value: "30+", label: "idiomas" },
              { value: "100%", label: "gratis" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-surface rounded-2xl border border-border p-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-xl font-bold font-display text-primary">
                  {stat.value}
                </p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="duo-btn duo-btn-primary w-full text-lg uppercase tracking-wide"
            >
              Empezar ahora
            </Link>
            <Link
              href="/login"
              className="duo-btn duo-btn-secondary w-full font-bold"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      progress: {
        where: { completed: true },
        select: { correct: true },
      },
      achievements: {
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
        take: 4,
      },
    },
  })

  if (!user) redirect("/login")

  const totalExercises = user.progress.length
  const correctExercises = user.progress.filter((p) => p.correct).length
  const accuracy = totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-6">
        {/* Greeting */}
        <div className="text-center space-y-3 animate-fade-in-up">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center text-2xl font-bold mx-auto border-2 border-primary/20">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            {user.streak > 0 && (
              <div className="absolute -bottom-1 -right-1 text-base animate-streak-fire">
                🔥
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold font-display text-text">
            ¡hola, {user.name ?? "estudiante"}!
          </h1>
          {user.learningLanguage && (
            <p className="text-sm text-text-muted">
              sigues aprendiendo {getLangName(user.learningLanguage)}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1">
            <span className="text-lg">✨</span>
            <p className="text-xl font-bold text-accent">{user.xp}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">xp total</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1">
            <span className={`text-lg ${user.streak > 0 ? "animate-streak-fire" : ""}`}>🔥</span>
            <p className={`text-xl font-bold ${user.streak > 0 ? "text-secondary" : "text-text-muted"}`}>{user.streak} días</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">racha</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1">
            <span className="text-lg">📝</span>
            <p className="text-xl font-bold text-text">{user.lessonsCompleted}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">lecciones</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1">
            <span className="text-lg">🎯</span>
            <p className={`text-xl font-bold ${accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-accent" : "text-text"}`}>{accuracy}%</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">precisión</p>
          </div>
        </div>

        {/* Continue learning CTA */}
        <Link
          href="/learn"
          className="duo-btn duo-btn-primary w-full text-base uppercase tracking-wide animate-fade-in-up"
        >
          continuar aprendiendo
        </Link>

        {/* Recent achievements */}
        {user.achievements.length > 0 && (
          <section className="space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">logros recientes</h2>
              <Link href="/profile" className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors">
                ver todos
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {user.achievements.map((ua) => (
                <div
                  key={ua.id}
                  className="flex items-center gap-2 p-3 rounded-2xl border border-border bg-surface"
                >
                  <span className="text-xl">{ua.achievement.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-text truncate">{ua.achievement.title}</p>
                    <p className="text-[10px] text-text-muted truncate">{ua.achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No achievements yet */}
        {user.achievements.length === 0 && (
          <div className="text-center space-y-2 py-8 animate-fade-in-up">
            <span className="text-3xl">🏅</span>
            <p className="text-sm text-text-muted">completa lecciones para desbloquear logros</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getLangName(code: string): string {
  const names: Record<string, string> = {
    en: "Inglés",
    fr: "Francés",
    de: "Alemán",
    it: "Italiano",
    pt: "Portugués",
    ja: "Japonés",
    ko: "Coreano",
    zh: "Chino",
    ru: "Ruso",
    ar: "Árabe",
  }
  return names[code] ?? code
}

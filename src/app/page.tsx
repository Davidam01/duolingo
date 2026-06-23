import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[5%] text-3xl opacity-10 animate-float" style={{ animationDelay: "0s" }}>🌟</div>
          <div className="absolute top-[20%] right-[8%] text-2xl opacity-10 animate-float" style={{ animationDelay: "1s" }}>✨</div>
          <div className="absolute bottom-[30%] left-[10%] text-2xl opacity-10 animate-float" style={{ animationDelay: "2s" }}>💫</div>
          <div className="absolute bottom-[20%] right-[5%] text-3xl opacity-10 animate-float" style={{ animationDelay: "0.5s" }}>⭐</div>
        </div>

        <div className="max-w-md w-full text-center space-y-10 relative z-10">
          <div className="space-y-4">
            <div className="text-7xl animate-bounce-in">🦉</div>
            <h1 className="text-5xl font-bold font-display text-text leading-tight">
              Aprende un idioma
            </h1>
            <p className="text-xl text-text-muted max-w-xs mx-auto leading-relaxed">
              Lecciones divertidas, cortas y gamificadas.{" "}
              <span className="text-primary font-semibold">Gratis para siempre.</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10M+", label: "estudiantes", delay: 0 },
              { value: "30+", label: "idiomas", delay: 100 },
              { value: "100%", label: "gratis", delay: 200 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-slide-up group"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <p className="text-2xl font-bold font-display text-primary group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="block w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] hover:-translate-y-0.5"
            >
              Empezar a aprender
            </Link>
            <Link
              href="/login"
              className="block w-full py-3.5 px-6 border-2 border-border text-text font-bold rounded-2xl text-lg transition-all hover:bg-surface hover:border-primary/30 active:scale-[0.98] hover:-translate-y-0.5"
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
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        {/* Greeting */}
        <div className="text-center space-y-2 animate-fade-in-up">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-4xl font-bold mx-auto border-2 border-primary/20 shadow-lg">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            {user.streak > 0 && (
              <div className="absolute -bottom-1 -right-1 text-lg animate-streak-fire">
                🔥
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold font-display text-text">
            ¡hola, {user.name ?? "estudiante"}!
          </h1>
          <p className="text-sm text-text-muted">
            {user.learningLanguage
              ? `sigues aprendiendo ${getLangName(user.learningLanguage)}`
              : "elige un idioma para empezar"}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-lg">✨</span>
            <p className="text-xl font-bold text-accent animate-count-up">{user.xp}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">xp total</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <span className={`text-lg ${user.streak > 0 ? "animate-streak-fire" : ""}`}>🔥</span>
            <p className={`text-xl font-bold ${user.streak > 0 ? "text-secondary" : "text-text-muted"}`}>{user.streak} días</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">racha</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-lg">📝</span>
            <p className="text-xl font-bold text-text">{user.lessonsCompleted}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">lecciones</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-lg">🎯</span>
            <p className={`text-xl font-bold ${accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-accent" : "text-text"}`}>{accuracy}%</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">precisión</p>
          </div>
        </div>

        {/* Continue learning CTA */}
        <Link
          href="/learn"
          className="block w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-lg text-center transition-all shadow-[0_4px_0_#58A700] hover:shadow-[0_2px_0_#58A700] hover:translate-y-[2px] active:translate-y-[3px] uppercase tracking-wide animate-fade-in-up"
        >
          continuar aprendiendo
        </Link>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
          <Link
            href="/leaderboard"
            className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🏆</span>
            <div>
              <p className="font-bold text-sm text-text">Clasificación</p>
              <p className="text-xs text-text-muted">compite con otros</p>
            </div>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
            <div>
              <p className="font-bold text-sm text-text">Perfil</p>
              <p className="text-xs text-text-muted">tus logros</p>
            </div>
          </Link>
        </div>

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
              {user.achievements.map((ua, i) => (
                <div
                  key={ua.id}
                  className="flex items-center gap-2 p-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.03] to-transparent hover:shadow-md transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
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

import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { languages, getLangName } from "@/lib/languages"

export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-surface">
        <div className="max-w-sm w-full text-center space-y-10">
          <div className="text-7xl animate-bounce-in">🦉</div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold font-display text-text leading-tight">
              aprende un idioma.
            </h1>
            <p className="text-lg text-text-muted">
              <span className="text-primary font-semibold">gratis.</span>
            </p>
          </div>

          <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto">
            5 minutos al día. sin anuncios. para siempre.
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 text-lg">
            {languages.slice(0, 7).map((l) => (
              <span key={l.code} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border text-xs text-text-muted">
                {l.flag} {l.name}
              </span>
            ))}
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-surface border border-border text-xs text-text-muted">
              +3 más
            </span>
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="duo-btn duo-btn-primary w-full text-lg uppercase tracking-wide"
            >
              empezar ahora
            </Link>
            <Link
              href="/login"
              className="duo-btn duo-btn-secondary w-full font-bold"
            >
              ya tengo cuenta
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
    <div className="flex-1 flex flex-col bg-surface">
      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        {/* Greeting row */}
        <div className="flex items-center gap-4 animate-fade-in-up">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0">
            {user.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-text">
              ¡hola, {user.name ?? "estudiante"}!
            </h1>
            {user.learningLanguage && (
              <p className="text-sm text-text-muted truncate">
                sigues aprendiendo {getLangName(user.learningLanguage)}
              </p>
            )}
          </div>
        </div>

        {/* Streak hero — signature element */}
        <div className="text-center space-y-2 py-4 animate-fade-in-up">
          <div className="relative inline-flex items-center justify-center">
            <span className="text-6xl animate-streak-fire">🔥</span>
          </div>
          <p className="text-4xl font-bold font-display text-text">
            {user.streak}
          </p>
          <p className="text-sm text-text-muted">
            {user.streak === 1 ? "día seguido" : "días seguidos"}
          </p>
        </div>

        {/* Compact stats row */}
        <div className="flex justify-center gap-6 text-center animate-fade-in-up">
          <div>
            <p className="text-lg font-bold text-accent">{user.xp}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">xp</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-lg font-bold text-text">{user.lessonsCompleted}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">lecciones</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className={`text-lg font-bold ${accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-accent" : "text-text"}`}>{accuracy}%</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">precisión</p>
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
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">logros recientes</h2>
              <Link href="/profile" className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors">
                ver todos
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {user.achievements.map((ua) => (
                <div
                  key={ua.id}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface"
                >
                  <span className="text-lg">{ua.achievement.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-text truncate">{ua.achievement.title}</p>
                    <p className="text-[10px] text-text-muted truncate">{ua.achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {user.achievements.length === 0 && (
          <div className="text-center space-y-2 py-8 animate-fade-in-up">
            <span className="text-3xl">🏅</span>
            <p className="text-sm text-text-muted">cada lección cuenta. sigue así.</p>
          </div>
        )}
      </div>
    </div>
  )
}



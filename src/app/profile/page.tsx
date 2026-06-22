import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LanguageChanger } from "@/components/language-changer"

export const metadata: Metadata = {
  title: "Perfil",
  description: "Tu progreso, estadísticas y logros",
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

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
      },
    },
  })

  if (!user) redirect("/login")

  const totalExercises = user.progress.length
  const correctExercises = user.progress.filter((p) => p.correct).length
  const accuracy = totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0

  const streakDays = user.streak

  const allAchievements = await prisma.achievement.findMany({ orderBy: { type: "asc" } })
  const unlockedIds = new Set(user.achievements.map((ua) => ua.achievementId))

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-white to-background">
      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        {/* Avatar y nombre */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-4xl font-bold mx-auto border-2 border-primary/20 shadow-lg">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            {streakDays > 0 && (
              <div className="absolute -bottom-1 -right-1 text-lg animate-streak-fire">
                🔥
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">{user.name ?? "Estudiante"}</h1>
            <p className="text-sm text-text-muted">{user.email}</p>
            {user.learningLanguage && (
              <p className="text-xs text-text-muted mt-1">
                Aprendiendo: <span className="font-semibold text-primary">{getLangName(user.learningLanguage)}</span>
              </p>
            )}
            {user.learningLanguage && (
              <div className="mt-2">
                <LanguageChanger currentLanguage={user.learningLanguage} />
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up">
            <span className="text-lg">✨</span>
            <p className="text-xl font-bold text-accent animate-count-up">{user.xp}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">xp total</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up delay-100">
            <span className={`text-lg ${streakDays > 0 ? "animate-streak-fire" : ""}`}>🔥</span>
            <p className={`text-xl font-bold ${streakDays > 0 ? "text-secondary" : "text-text-muted"}`}>{streakDays} días</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">racha</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up delay-200">
            <span className="text-lg">📝</span>
            <p className="text-xl font-bold text-text">{totalExercises}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">ejercicios</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up delay-300">
            <span className="text-lg">🎯</span>
            <p className={`text-xl font-bold ${accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-accent" : "text-text"}`}>{accuracy}%</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">precisión</p>
          </div>
        </div>

        {/* Logros */}
        <section className="space-y-4 animate-fade-in-up">
          <h2 className="text-lg font-bold text-text">logros</h2>
          {allAchievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {allAchievements.map((ach, i) => {
                const unlocked = unlockedIds.has(ach.id)
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 hover:shadow-md animate-slide-up ${
                      unlocked
                        ? "border-primary/30 bg-gradient-to-br from-primary/[0.03] to-transparent hover:border-primary/50"
                        : "border-border bg-surface opacity-50"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${unlocked ? "" : "grayscale"}`}>
                        {unlocked ? ach.icon : "🔒"}
                      </span>
                      <div className="min-w-0">
                        <p className={`font-semibold text-xs truncate ${unlocked ? "text-text" : "text-text-muted"}`}>
                          {ach.title}
                        </p>
                        <p className="text-[10px] text-text-muted truncate">
                          {unlocked ? ach.description : "??? ??? ???"}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-text-muted text-center py-8 text-sm">
              No hay logros disponibles
            </p>
          )}

          {user.achievements.length > 0 && (
            <details className="group">
              <summary className="text-sm text-text-muted cursor-pointer hover:text-text transition-colors">
                desbloqueados recientemente
              </summary>
              <div className="mt-3 space-y-2">
                {user.achievements.slice(0, 5).map((ua) => (
                  <div
                    key={ua.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface animate-fade-in-up"
                  >
                    <span className="text-xl">{ua.achievement.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-text">{ua.achievement.title}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(ua.unlockedAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
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

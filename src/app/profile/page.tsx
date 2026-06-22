import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

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

  const streakDays = calculateStreak(user.lastActivity)

  const allAchievements = await prisma.achievement.findMany({ orderBy: { type: "asc" } })
  const unlockedIds = new Set(user.achievements.map((ua) => ua.achievementId))

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold mx-auto border-2 border-primary/20">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">{user.name ?? "Estudiante"}</h1>
            <p className="text-sm text-text-muted">{user.email}</p>
            {user.learningLanguage && (
              <p className="text-xs text-text-muted mt-1">
                Aprendiendo: <span className="font-semibold text-primary">{getLangName(user.learningLanguage)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="xp total"
            value={user.xp.toString()}
            color="text-accent"
            icon="✨"
          />
          <StatCard
            label="racha"
            value={`${streakDays} días`}
            color="text-secondary"
            icon="🔥"
          />
          <StatCard
            label="ejercicios"
            value={totalExercises.toString()}
            color="text-text"
            icon="📝"
          />
          <StatCard
            label="precisión"
            value={`${accuracy}%`}
            color="text-success"
            icon="🎯"
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text">logros</h2>
          {allAchievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {allAchievements.map((ach) => {
                const unlocked = unlockedIds.has(ach.id)
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      unlocked
                        ? "border-primary/30 bg-primary/[0.03]"
                        : "border-border bg-surface opacity-50"
                    }`}
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

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: string
  icon: string
}) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-surface text-center space-y-1 shadow-sm">
      <span className="text-lg">{icon}</span>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
    </div>
  )
}

function calculateStreak(lastActivity: Date | null): number {
  if (!lastActivity) return 0
  const now = new Date()
  const diff = now.getTime() - lastActivity.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return days <= 1 ? 1 : 0
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

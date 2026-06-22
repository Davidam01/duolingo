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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold mx-auto">
          {user.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text">{user.name ?? "Estudiante"}</h1>
          <p className="text-text-muted">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="XP total" value={user.xp.toString()} color="text-accent" />
        <StatCard label="Racha" value={`${streakDays} días`} color="text-secondary" />
        <StatCard label="Ejercicios" value={totalExercises.toString()} color="text-text" />
        <StatCard label="Precisión" value={`${accuracy}%`} color="text-success" />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-text">Logros</h2>
        {user.achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {user.achievements.map((ua) => (
              <div
                key={ua.id}
                className="p-4 rounded-2xl border-2 border-border bg-surface flex items-center gap-3"
              >
                <span className="text-2xl">{ua.achievement.icon ?? "🏆"}</span>
                <div>
                  <p className="font-semibold text-text text-sm">{ua.achievement.title}</p>
                  <p className="text-xs text-text-muted">{ua.achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-center py-8">
            Completa lecciones para desbloquear logros
          </p>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-2xl border-2 border-border bg-surface text-center space-y-1">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
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

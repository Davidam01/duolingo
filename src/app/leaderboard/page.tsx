import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"


export const metadata: Metadata = {
  title: "Clasificación",
  description: "Ranking semanal de los mejores estudiantes",
}

export default async function LeaderboardPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect("/login")

  const topUsers = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
    },
  })

  const currentRank = topUsers.findIndex((u) => u.id === userId) + 1
  const currentUser = topUsers.find((u) => u.id === userId)
  const totalParticipants = topUsers.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-text">Clasificación global</h1>
        <p className="text-text-muted">
          {totalParticipants} estudiantes compitiendo
        </p>
      </div>

      {currentUser && (
        <div className="bg-surface border-2 border-primary rounded-2xl p-4 flex items-center gap-4 shadow-card animate-fade-in-up">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
            {currentRank}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text">{currentUser.name ?? "Tú"}</p>
            <p className="text-sm text-text-muted">
              Puesto #{currentRank} de {totalParticipants}
            </p>
          </div>
          <span className="text-lg font-bold text-accent">{currentUser.xp} XP</span>
        </div>
      )}

      <div className="space-y-2">
        {topUsers.map((user, index) => {
          const rank = index + 1
          const isMe = user.id === userId
          const medal =
            rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null

          return (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                isMe
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center text-xl font-bold">
                {medal ?? `#${rank}`}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text">{user.name ?? "Anónimo"}</p>
              </div>
              <span className="text-sm font-bold text-accent">{user.xp} XP</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

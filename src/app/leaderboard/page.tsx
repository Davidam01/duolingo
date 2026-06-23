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
    <div className="flex-1 flex flex-col bg-surface">
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-text">Clasificación global</h1>
        <p className="text-text-muted">
          {totalParticipants} estudiantes compitiendo
        </p>
      </div>

      {/* Current user card */}
      {currentUser && (
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/40 rounded-2xl p-4 flex items-center gap-4 shadow-lg animate-slide-up">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md">
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

      {/* Top 3 podium */}
      {topUsers.length >= 3 && (
        <div className="flex items-end justify-center gap-3 px-4 pt-4">
          {[1, 0, 2].map((pos) => {
            const user = topUsers[pos]
            const rank = pos + 1
            const heights = ["h-24", "h-20", "h-16"]
            const medals = ["🥇", "🥈", "🥉"]
            return (
              <div key={user.id} className="flex flex-col items-center gap-2 animate-slide-up" style={{ animationDelay: `${pos * 150}ms` }}>
                <div className="text-2xl">{medals[pos]}</div>
                <div
                  className={`w-20 rounded-t-xl flex items-center justify-center font-bold text-white text-sm transition-all hover:opacity-90 ${heights[pos]} ${
                    user.id === userId
                      ? "bg-gradient-to-t from-primary to-primary/70"
                      : "bg-gradient-to-t from-text-muted to-border"
                  }`}
                >
                  #{rank}
                </div>
                <p className="text-xs font-semibold text-text text-center max-w-[80px] truncate">
                  {user.name ?? "Anónimo"}
                </p>
                <p className="text-[10px] font-bold text-accent">{user.xp} XP</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Rest of the list */}
      <div className="space-y-2">
        {topUsers.slice(topUsers.length >= 3 ? 3 : 0).map((user, index) => {
          const rank = index + (topUsers.length >= 3 ? 4 : 1)
          const isMe = user.id === userId

          return (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md animate-slide-up ${
                isMe
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-surface hover:border-primary/30 hover:-translate-y-0.5"
              }`}
              style={{ animationDelay: `${(index + 3) * 50}ms` }}
            >
              <div className="w-10 h-10 flex items-center justify-center text-lg font-bold text-text-muted">
                #{rank}
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
    </div>
  )
}

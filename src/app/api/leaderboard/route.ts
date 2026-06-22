import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

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

  const rank = topUsers.findIndex((u) => u.id === userId) + 1
  const total = topUsers.length

  const currentUser = topUsers.find((u) => u.id === userId)

  return NextResponse.json({
    entries: topUsers.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name ?? "Anónimo",
      image: u.image,
      xp: u.xp,
      isCurrentUser: u.id === userId,
    })),
    currentUserRank: rank > 0 ? rank : null,
    currentUserXp: currentUser?.xp ?? 0,
    totalParticipants: total,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  })
}

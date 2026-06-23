import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyAchievements } from "@/lib/achievements"

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { correct, total } = await request.json()

    const xpEarned = Math.round((correct / total) * 100)
    const allCorrect = correct === total
    const now = new Date()

    // Get current user streak data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastActivity: true },
    })

    // Calculate streak
    let newStreak = 1
    if (user?.lastActivity) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastActive = new Date(user.lastActivity)
      lastActive.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= 1) {
        // Consecutive day or same day
        newStreak = diffDays === 0 ? user.streak : user.streak + 1
      }
      // If diffDays > 1, streak resets to 1 (already set above)
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          streak: newStreak,
          lastActivity: now,
          lessonsCompleted: { increment: 1 },
          ...(allCorrect ? { perfectLessons: { increment: 1 } } : {}),
        },
      })
    })

    // Verify achievements after completing lesson
    const unlocked = await verifyAchievements(userId)

    return NextResponse.json({ xp: xpEarned, unlocked })
  } catch {
    return NextResponse.json({ error: "Error al completar lección" }, { status: 500 })
  }
}

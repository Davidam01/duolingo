import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, streak: true, perfectLessons: true },
    })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const allAchievements = await prisma.achievement.findMany()
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementId: true },
    })
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId))

    const newUnlocks: { id: string; title: string; icon: string | null }[] = []

    for (const ach of allAchievements) {
      if (unlockedIds.has(ach.id)) continue

      let shouldUnlock = false
      switch (ach.type) {
        case "XP_MILESTONE":
          shouldUnlock = user.xp >= ach.threshold
          break
        case "STREAK":
          shouldUnlock = user.streak >= ach.threshold
          break
        case "LESSONS_COMPLETED": {
          const lessonsDone = await prisma.progress.groupBy({
            by: ["exerciseId"],
            where: {
              userId: session.user.id,
              completed: true,
            },
          })
          const lessonCount = lessonsDone.length
          shouldUnlock = lessonCount >= ach.threshold
          break
        }
        case "PERFECT_LESSON":
          shouldUnlock = user.perfectLessons >= ach.threshold
          break
      }

      if (shouldUnlock) {
        await prisma.userAchievement.create({
          data: {
            userId: session.user.id,
            achievementId: ach.id,
          },
        })
        newUnlocks.push({ id: ach.id, title: ach.title, icon: ach.icon })
      }
    }

    return NextResponse.json({ unlocked: newUnlocks })
  } catch {
    return NextResponse.json({ error: "Error al verificar logros" }, { status: 500 })
  }
}

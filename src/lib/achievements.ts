import { prisma } from "@/lib/prisma"

export type AchievementUnlock = {
  id: string
  title: string
  icon: string | null
}

/**
 * Verifies all achievements for a given user and unlocks any new ones.
 * Returns the list of newly unlocked achievements.
 */
export async function verifyAchievements(userId: string): Promise<AchievementUnlock[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, streak: true, perfectLessons: true, lessonsCompleted: true },
  })

  if (!user) return []

  const allAchievements = await prisma.achievement.findMany()
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId))

  const newUnlocks: AchievementUnlock[] = []

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
      case "LESSONS_COMPLETED":
        shouldUnlock = user.lessonsCompleted >= ach.threshold
        break
      case "PERFECT_LESSON":
        shouldUnlock = user.perfectLessons >= ach.threshold
        break
    }

    if (shouldUnlock) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: ach.id,
        },
      })
      newUnlocks.push({ id: ach.id, title: ach.title, icon: ach.icon })
    }
  }

  return newUnlocks
}

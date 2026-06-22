import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { lessonId, correct, total } = await request.json()

    const xpEarned = Math.round((correct / total) * 100)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          lastActivity: new Date(),
        },
      })
    })

    return NextResponse.json({ xp: xpEarned })
  } catch {
    return NextResponse.json({ error: "Error al completar lección" }, { status: 500 })
  }
}

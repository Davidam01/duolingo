import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const progress = await prisma.progress.findMany({
    where: { userId: session.user.id },
    include: {
      exercise: {
        select: { id: true, type: true, lessonId: true },
      },
    },
  })

  return NextResponse.json(progress)
}

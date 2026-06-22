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

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { exerciseId, correct } = await request.json()

    if (!exerciseId) {
      return NextResponse.json({ error: "exerciseId requerido" }, { status: 400 })
    }

    const existing = await prisma.progress.findUnique({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const progress = await prisma.progress.create({
      data: {
        userId: session.user.id,
        exerciseId,
        correct,
        completed: true,
      },
    })

    return NextResponse.json(progress, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al guardar progreso" }, { status: 500 })
  }
}

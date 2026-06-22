import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const lessons = await prisma.lesson.findMany({
    include: {
      section: {
        include: {
          course: true,
        },
      },
      exercises: {
        select: { id: true },
      },
    },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(lessons)
}

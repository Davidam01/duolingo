import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LessonClient } from "./lesson-client"

export const metadata: Metadata = {
  title: "Lección",
  description: "Completa los ejercicios de la lección",
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { exercises: true },
  })

  if (!lesson) redirect("/learn")

  const exercises = lesson.exercises.map((ex) => ({
    id: ex.id,
    type: ex.type,
    question: ex.question,
    options: JSON.parse(ex.options ?? "[]") as string[],
    answer: ex.answer,
  }))

  return (
    <div className="flex-1 flex flex-col">
      <LessonClient exercises={exercises} lessonId={id} />
    </div>
  )
}

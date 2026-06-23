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

  if (!lesson) redirect("/")

  const exercises = lesson.exercises.map((ex) => {
    let options: string[] = []
    try {
      options = JSON.parse(ex.options ?? "[]") as string[]
    } catch {
      options = []
    }
    return {
      id: ex.id,
      type: ex.type,
      difficulty: ex.difficulty,
      question: ex.question,
      options,
      answer: ex.answer,
    }
  })

  if (exercises.length === 0) redirect("/learn")

  // Check prerequisite: previous lesson in same section must be completed
  const previousLesson = await prisma.lesson.findFirst({
    where: {
      sectionId: lesson.sectionId,
      order: lesson.order - 1,
    },
    select: { id: true },
  })

  if (previousLesson) {
    const previousExercises = await prisma.exercise.findMany({
      where: { lessonId: previousLesson.id },
      select: { id: true },
    })
    const previousIds = previousExercises.map((e) => e.id)

    const completed = await prisma.progress.count({
      where: {
        userId: session.user.id,
        exerciseId: { in: previousIds },
        completed: true,
      },
    })

    if (completed < previousIds.length) redirect("/learn")
  }

  return (
    <div className="flex-1 flex flex-col bg-surface">
      <LessonClient exercises={exercises} lessonId={id} />
    </div>
  )
}

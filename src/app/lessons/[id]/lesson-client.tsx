"use client"

import { useRouter } from "next/navigation"
import { LessonFlow, type ExerciseData } from "@/components/lesson-flow"

export function LessonClient({
  exercises,
  lessonId,
}: {
  exercises: ExerciseData[]
  lessonId: string
}) {
  const router = useRouter()

  async function handleComplete(correct: number, total: number, _xp: number) {
    await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, correct, total }),
    })
    router.push("/learn")
    router.refresh()
  }

  return <LessonFlow exercises={exercises} lessonId={lessonId} onComplete={handleComplete} />
}

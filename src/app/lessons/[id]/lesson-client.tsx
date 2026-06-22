"use client"

import { useRouter } from "next/navigation"
import { LessonFlow, type ExerciseData } from "@/components/lesson-flow"

export function LessonClient({
  exercises,
}: {
  exercises: ExerciseData[]
}) {
  const router = useRouter()

  async function handleComplete(correct: number, total: number) {
    await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correct, total }),
    })
    router.push("/learn")
  }

  return <LessonFlow exercises={exercises} onComplete={handleComplete} />
}

"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { LessonFlow, type ExerciseData } from "@/components/lesson-flow"
import { AchievementNotification } from "@/components/achievement-notification"

type AchievementUnlock = {
  id: string
  title: string
  icon: string | null
}

export function LessonClient({
  exercises,
  lessonId,
}: {
  exercises: ExerciseData[]
  lessonId: string
}) {
  const router = useRouter()
  const [notification, setNotification] = useState<AchievementUnlock | null>(null)

  const handleComplete = useCallback(async (correct: number, total: number) => {
    const res = await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correct, total, lessonId }),
    })
    const data = await res.json()
    if (data.unlocked?.length > 0) {
      setNotification(data.unlocked[0])
    } else {
      router.push("/learn")
    }
  }, [router, lessonId])

  function handleNotificationClose() {
    setNotification(null)
    router.push("/learn")
  }

  return (
    <>
      <LessonFlow exercises={exercises} onComplete={handleComplete} />
      {notification && (
        <AchievementNotification
          icon={notification.icon}
          title={notification.title}
          onClose={handleNotificationClose}
        />
      )}
    </>
  )
}

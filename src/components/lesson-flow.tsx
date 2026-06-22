"use client"

import { useState, useCallback } from "react"
import { ExerciseCard } from "./exercise-card"

export type ExerciseData = {
  id: string
  type: string
  question: string
  options: string[]
  answer: string
}

interface LessonFlowProps {
  exercises: ExerciseData[]
  lessonId: string
  onComplete: (correct: number, total: number, xp: number) => void
}

export function LessonFlow({ exercises, lessonId, onComplete }: LessonFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [savingError, setSavingError] = useState(false)

  const exercise = exercises[currentIndex]

  const handleAnswer = useCallback(
    async (userAnswer: string) => {
      const correct = userAnswer === exercise.answer
      const newCorrect = correct ? correctCount + 1 : correctCount
      setCorrectCount(newCorrect)

      try {
        setSavingError(false)
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.id,
            correct,
            lessonId,
          }),
        })
        if (!res.ok) throw new Error("Error al guardar progreso")
      } catch {
        setSavingError(true)
      }

      if (currentIndex < exercises.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        const total = exercises.length
        const xp = Math.round((newCorrect / total) * 100)
        setCompleted(true)
        onComplete(newCorrect, total, xp)
      }
    },
    [exercise, currentIndex, exercises.length, correctCount, lessonId, onComplete],
  )

  if (completed) {
    const total = exercises.length
    const pct = Math.round((correctCount / total) * 100)
    const earnedXp = Math.round((correctCount / total) * 100)
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center space-y-4 animate-scale-in">
        <div className="text-7xl animate-bounce-in">{pct >= 80 ? "🎉" : "💪"}</div>
        <h2 className="text-2xl font-bold text-text">
          {pct >= 80 ? "¡Lección completada!" : "Sigue practicando"}
        </h2>
        <p className="text-text-muted">
          {correctCount} de {total} correctas
        </p>
        <p className="text-3xl font-bold text-accent">+{earnedXp} XP</p>
      </div>
    )
  }

  const progress = ((currentIndex) / exercises.length) * 100

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-text-muted">
          <span>
            Ejercicio {currentIndex + 1} de {exercises.length}
          </span>
          <span>{correctCount} correctas</span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ExerciseCard
        key={exercise.id}
        type={exercise.type}
        question={exercise.question}
        options={exercise.options}
        answer={exercise.answer}
        onAnswer={handleAnswer}
      />

      {savingError && (
        <p className="text-sm text-error text-center animate-fade-in-up">
          Error al guardar progreso, pero tu respuesta se registró
        </p>
      )}
    </div>
  )
}

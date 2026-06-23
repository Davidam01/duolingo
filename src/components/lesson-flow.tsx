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
  onComplete: (correct: number, total: number) => void
}

export function LessonFlow({ exercises, onComplete }: LessonFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [savingError, setSavingError] = useState(false)

  const exercise = exercises[currentIndex]

  const handleAnswer = useCallback(
    async (userAnswer: string) => {
      const correct = userAnswer.toLowerCase().trim() === exercise.answer.toLowerCase().trim()
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
        setCompleted(true)
        onComplete(newCorrect, total)
      }
    },
    [exercise, currentIndex, exercises.length, correctCount, onComplete],
  )

  if (completed) {
    const total = exercises.length
    const pct = Math.round((correctCount / total) * 100)
    const earnedXp = Math.round((correctCount / total) * 100)
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center space-y-6 animate-scale-in">
        {/* Confetti-like decoration */}
        <div className="relative">
          {pct >= 80 && (
            <>
              <span className="absolute -top-2 -left-6 text-lg animate-confetti">🎊</span>
              <span className="absolute -top-1 -right-5 text-lg animate-confetti" style={{ animationDelay: "0.2s" }}>✨</span>
              <span className="absolute bottom-0 -left-7 text-lg animate-confetti" style={{ animationDelay: "0.4s" }}>🌟</span>
            </>
          )}
          <div className="text-7xl animate-bounce-in">{pct >= 80 ? "🎉" : "💪"}</div>
        </div>
        <h2 className="text-2xl font-bold text-text">
          {pct >= 80 ? "¡Lección completada!" : "Sigue practicando"}
        </h2>
        <div className="space-y-1">
          <p className="text-text-muted">
            {correctCount} de {total} correctas
          </p>
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-500 animate-fade-in ${
                  i < correctCount
                    ? "bg-success shadow-[0_0_6px_rgba(0,168,132,0.4)]"
                    : "bg-border"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
        <p className="text-4xl font-bold text-accent animate-fade-in">+{earnedXp} XP</p>
      </div>
    )
  }

  const progress = ((currentIndex) / exercises.length) * 100

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      {/* Progress dots + bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted font-medium">
            ejercicio {currentIndex + 1} de {exercises.length}
          </span>
          <span className="text-sm text-text-muted">{correctCount} correctas</span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: exercises.length }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? "bg-primary"
                  : i === currentIndex
                    ? "bg-primary/40 ring-2 ring-primary/30"
                    : "bg-border"
              }`}
            />
          ))}
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
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
        <div className="animate-slide-up">
          <p className="text-sm text-error text-center bg-error/5 p-3 rounded-xl border border-error/20">
            Error al guardar progreso, pero tu respuesta se registró
          </p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"

interface ExerciseCardProps {
  type: string
  question: string
  options: string[]
  answer: string
  onAnswer: (answer: string) => void
}

export function ExerciseCard({ type, question, options, answer, onAnswer }: ExerciseCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)

  const handleConfirm = useCallback(() => {
    if (!selected || answered) return
    setAnswered(true)
    const isCorrect = selected === answer
    setCorrect(isCorrect)
    setTimeout(() => onAnswer(selected), 600)
  }, [selected, answered, answer, onAnswer])

  const isTranslation = type === "TRANSLATION"
  const isFillBlank = type === "FILL_BLANK"

  return (
    <div className="space-y-6 animate-fade-in-up">
      {isTranslation && (
        <p className="text-sm text-text-muted text-center">Traduce la siguiente frase</p>
      )}

      <h2 className={`text-xl font-bold text-text text-center ${isTranslation ? "italic" : ""} ${isFillBlank ? "leading-relaxed" : ""}`}>
        {question}
      </h2>

      <div className={isFillBlank ? "grid grid-cols-2 gap-3" : "space-y-3"}>
        {options.map((option) => {
          const isSelected = selected === option
          const isCorrectOption = option === answer
          let variant = "border-border bg-surface text-text hover:border-primary/50"

          if (answered) {
            if (isCorrectOption) {
              variant = "border-success bg-success/5 text-success"
            } else if (isSelected && !isCorrectOption) {
              variant = "border-error bg-error/5 text-error"
            } else {
              variant = "border-border bg-surface/50 text-text-muted"
            }
          } else if (isSelected) {
            variant = "border-primary bg-primary/5 text-primary"
          }

          return (
            <button
              key={option}
              onClick={() => !answered && setSelected(option)}
              className={`w-full py-4 px-6 rounded-2xl border-2 text-left text-lg font-medium transition-all ${variant} ${answered ? "cursor-default" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {answered && isCorrectOption && <span className="text-lg">✅</span>}
                {answered && isSelected && !isCorrectOption && <span className="text-lg">❌</span>}
              </div>
            </button>
          )
        })}
      </div>

      {answered && correct === false && (
        <p className="text-sm text-center text-text-muted">
          Respuesta correcta: <span className="font-bold text-success">{answer}</span>
        </p>
      )}

      <div className="pt-4">
        <button
          onClick={handleConfirm}
          disabled={!selected || answered}
          className="w-full py-3 px-6 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-2xl text-lg transition-all active:scale-[0.97] disabled:active:scale-100"
        >
          {answered ? "Siguiente →" : "Confirmar"}
        </button>
      </div>
    </div>
  )
}

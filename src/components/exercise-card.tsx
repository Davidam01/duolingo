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
        <p className="text-sm text-text-muted text-center uppercase tracking-wider font-bold">
          traduce la frase
        </p>
      )}

      <h2 className={`text-xl font-bold text-text text-center leading-relaxed ${isTranslation ? "italic" : ""}`}>
        {question}
      </h2>

      <div className={isFillBlank ? "grid grid-cols-2 gap-3" : "space-y-3"}>
        {options.map((option) => {
          const isSelected = selected === option
          const isCorrectOption = option === answer
          let variant = "border-border bg-surface text-text hover:border-primary/50 hover:shadow-sm"

          if (answered) {
            if (isCorrectOption) {
              variant = "border-success bg-success/5 text-success"
            } else if (isSelected && !isCorrectOption) {
              variant = "border-error bg-error/5 text-error"
            } else {
              variant = "border-border bg-surface/50 text-text-muted"
            }
          } else if (isSelected) {
            variant = "border-primary bg-primary/5 text-primary shadow-[0_2px_0_#58A700]"
          }

          return (
            <button
              key={option}
              onClick={() => !answered && setSelected(option)}
              className={`w-full py-4 px-6 rounded-2xl border-[3px] text-left text-lg font-medium transition-all active:scale-[0.98] ${variant} ${answered ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{option}</span>
                {answered && isCorrectOption && (
                  <span className="text-lg shrink-0 animate-bounce-in">✅</span>
                )}
                {answered && isSelected && !isCorrectOption && (
                  <span className="text-lg shrink-0 animate-bounce-in">❌</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {answered && correct === false && (
        <p className="text-sm text-center text-text-muted animate-fade-in-up bg-error/5 p-3 rounded-xl border border-error/20">
          respuesta correcta: <span className="font-bold text-success">{answer}</span>
        </p>
      )}

      <div className="pt-2">
        <button
          onClick={handleConfirm}
          disabled={!selected || answered}
          className="w-full py-4 px-6 bg-primary text-white font-bold text-lg rounded-2xl shadow-[0_4px_0_#58A700] hover:shadow-[0_2px_0_#58A700] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:translate-y-0 uppercase tracking-wide"
        >
          {answered ? "siguiente →" : "confirmar"}
        </button>
      </div>
    </div>
  )
}

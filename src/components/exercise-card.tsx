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
    if (isCorrect) {
      setTimeout(() => onAnswer(selected), 600)
    }
  }, [selected, answered, answer, onAnswer])

  const handleNext = useCallback(() => {
    if (selected === null) return
    onAnswer(selected)
  }, [selected, onAnswer])

  const isTranslation = type === "TRANSLATION"
  const isFillBlank = type === "FILL_BLANK"

  const getOptionVariant = (option: string) => {
    const isSelected = selected === option
    const isCorrectOption = option === answer

    if (answered) {
      if (isCorrectOption) return "border-success bg-success/10 text-success shadow-[0_0_0_3px_rgba(0,168,132,0.15)]"
      if (isSelected && !isCorrectOption) return "border-error bg-error/10 text-error shadow-[0_0_0_3px_rgba(255,75,75,0.15)]"
      return "border-border bg-surface/30 text-text-muted"
    }
    if (isSelected) return "border-primary bg-primary/10 text-primary shadow-[0_3px_0_#58A700]"
    return "border-border bg-surface text-text hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Tipo de ejercicio */}
      {isTranslation && (
        <p className="text-sm text-text-muted text-center uppercase tracking-wider font-bold">
          traduce la frase
        </p>
      )}

      {/* Pregunta */}
      <h2 className={`text-xl font-bold text-text text-center leading-relaxed ${isTranslation ? "italic" : ""}`}>
        {question}
      </h2>

      {/* Opciones */}
      <div className={`${isFillBlank ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
        {options.map((option) => {
          const isSelected = selected === option
          const isCorrectOption = option === answer
          return (
            <button
              key={option}
              onClick={() => !answered && setSelected(option)}
              className={`w-full py-4 px-6 rounded-2xl border-[3px] text-left text-lg font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer ${getOptionVariant(option)}`}
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

      {/* Feedback de respuesta incorrecta */}
      {answered && correct === false && (
        <div className="animate-slide-up">
          <p className="text-sm text-center text-text-muted bg-error/5 p-3 rounded-xl border border-error/20">
            respuesta correcta: <span className="font-bold text-success">{answer}</span>
          </p>
        </div>
      )}

      {/* Feedback de respuesta correcta */}
      {answered && correct === true && (
        <div className="text-center animate-slide-up">
          <p className="text-sm font-bold text-success">✓ ¡Correcto!</p>
        </div>
      )}

      {/* Botón de confirmar/continuar */}
      <div className="pt-2">
        <button
          onClick={answered && correct === false ? handleNext : handleConfirm}
          disabled={!selected || (answered && correct !== false)}
          className="duo-btn duo-btn-primary w-full text-lg uppercase tracking-wide"
        >
          {answered && correct === false ? "siguiente →" : answered ? "siguiente →" : "confirmar"}
        </button>
      </div>
    </div>
  )
}

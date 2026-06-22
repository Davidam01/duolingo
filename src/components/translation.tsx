"use client"

import { useState, useCallback } from "react"

interface TranslationProps {
  question: string
  options: string[]
  onAnswer: (answer: string) => void
}

export function Translation({ question, options, onAnswer }: TranslationProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleConfirm = useCallback(() => {
    if (!selected || answered) return
    setAnswered(true)
    onAnswer(selected)
  }, [selected, answered, onAnswer])

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-muted text-center">Traduce la siguiente frase</p>
      <h2 className="text-xl font-bold text-text text-center italic">{question}</h2>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => !answered && setSelected(option)}
            className={`w-full py-4 px-6 rounded-2xl border-2 text-left text-lg font-medium transition-all ${
              selected === option
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-surface text-text hover:border-primary/50"
            } ${answered ? "opacity-50 cursor-default" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="pt-4">
        <button
          onClick={handleConfirm}
          disabled={!selected || answered}
          className="w-full py-3 px-6 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-2xl text-lg transition-colors"
        >
          {answered ? "Siguiente →" : "Confirmar"}
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"

interface ExerciseCardProps {
  type: string
  difficulty?: string
  question: string
  options: string[]
  answer: string
  onAnswer: (answer: string) => void
}

const difficultyConfig: Record<string, { label: string, icon: string, className: string }> = {
  BEGINNER: { label: "principiante", icon: "★", className: "text-success" },
  INTERMEDIATE: { label: "intermedio", icon: "★★", className: "text-accent" },
  ADVANCED: { label: "avanzado", icon: "★★★", className: "text-error" },
}

function playAudio(text: string) {
  if (typeof window === "undefined") return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  } catch {
    // TTS not available
  }
}

export function ExerciseCard({ type, difficulty, question, options, answer: correctAnswer, onAnswer }: ExerciseCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)

  const isTranslation = type === "TRANSLATION"
  const isFillBlank = type === "FILL_BLANK"
  const isListening = type === "LISTENING"
  const isOrdering = type === "ORDERING"
  const isFreeForm = type === "FREE_FORM"

  // ORDERING state
  const parsedWords = isOrdering ? (JSON.parse(options[0] ?? "[]") as string[]) : []
  const [available, setAvailable] = useState<string[]>(parsedWords)
  const [sentence, setSentence] = useState<string[]>([])

  // FREE_FORM state
  const [inputValue, setInputValue] = useState("")
  const [listeningPlaying, setListeningPlaying] = useState(false)

  const handleConfirm = useCallback(() => {
    if (answered) return
    let userAnswer = selected ?? ""
    if (isFreeForm) {
      userAnswer = inputValue.trim()
    } else if (isOrdering) {
      userAnswer = sentence.join(" ")
    }
    if (!userAnswer) return
    setAnswered(true)
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    setCorrect(isCorrect)
    if (isCorrect) {
      setTimeout(() => onAnswer(userAnswer), 600)
    }
  }, [answered, selected, isFreeForm, inputValue, isOrdering, sentence, correctAnswer, onAnswer])

  const handleNext = useCallback(() => {
    let userAnswer = selected ?? ""
    if (isFreeForm) {
      userAnswer = inputValue.trim()
    } else if (isOrdering) {
      userAnswer = sentence.join(" ")
    }
    if (!userAnswer) return
    onAnswer(userAnswer)
  }, [selected, isFreeForm, inputValue, isOrdering, sentence, onAnswer])

  const handlePlay = useCallback(() => {
    setListeningPlaying(true)
    playAudio(question)
    const checkEnd = setInterval(() => {
      if (window.speechSynthesis?.speaking === false) {
        setListeningPlaying(false)
        clearInterval(checkEnd)
      }
    }, 200)
    setTimeout(() => {
      clearInterval(checkEnd)
      setListeningPlaying(false)
    }, 5000)
  }, [question])

  function moveToSentence(word: string) {
    setAvailable((prev) => prev.filter((w) => w !== word))
    setSentence((prev) => [...prev, word])
  }

  function moveToAvailable(word: string) {
    setSentence((prev) => prev.filter((w) => w !== word))
    setAvailable((prev) => [...prev, word])
  }

  const isAnswerReady = (): boolean => {
    if (answered) return false
    if (isFreeForm) return !!inputValue.trim()
    if (isOrdering) return sentence.length > 0
    return selected !== null
  }

  const diff = difficulty ? difficultyConfig[difficulty] : null

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Difficulty badge */}
      {diff && (
        <div className="flex justify-center">
          <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${diff.className}`}>
            <span>{diff.icon}</span>
            {diff.label}
          </span>
        </div>
      )}

      {/* Type labels */}
      {isTranslation && (
        <p className="text-sm text-text-muted text-center uppercase tracking-wider font-bold">
          traduce la frase
        </p>
      )}
      {isListening && (
        <p className="text-sm text-text-muted text-center uppercase tracking-wider font-bold">
          escucha y responde
        </p>
      )}
      {isOrdering && (
        <p className="text-sm text-text-muted text-center uppercase tracking-wider font-bold">
          ordena las palabras
        </p>
      )}

      {/* Question area */}
      {isListening ? (
        <div className="text-center space-y-3">
          <button
            onClick={handlePlay}
            disabled={listeningPlaying || answered}
            className="text-5xl mx-auto block transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Escuchar pronunciación"
          >
            {listeningPlaying ? "🔊" : "🔇"}
          </button>
          {selected && (
            <p className="text-base text-text-muted">
              {question}
            </p>
          )}
        </div>
      ) : !isFreeForm ? (
        <h2 className={`text-xl font-bold text-text text-center leading-relaxed ${isTranslation ? "italic" : ""}`}>
          {question}
        </h2>
      ) : null}

      {/* Interaction area */}
      {isFreeForm ? (
        <div className="space-y-3">
          <p className="text-lg font-bold text-text text-center">{question}</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="escribe tu respuesta..."
            disabled={answered}
            className="w-full py-4 px-6 rounded-2xl border-[3px] border-border bg-surface text-text text-lg font-medium text-center outline-none transition-colors focus:border-primary disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim() && !answered) {
                handleConfirm()
              }
            }}
          />
        </div>
      ) : isOrdering ? (
        <div className="space-y-4">
          <p className="text-lg font-bold text-text text-center">{question}</p>
          <div className="min-h-[56px] flex flex-wrap gap-2 justify-center p-4 rounded-2xl border-[3px] border-dashed border-border/60 bg-surface/50">
            {sentence.length === 0 ? (
              <span className="text-sm text-text-muted self-center">toca las palabras en orden</span>
            ) : (
              sentence.map((word, i) => (
                <button
                  key={`s-${word}-${i}`}
                  onClick={() => !answered && moveToAvailable(word)}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-base transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                  disabled={answered}
                >
                  {word}
                </button>
              ))
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {available.map((word, i) => (
              <button
                key={`a-${word}-${i}`}
                onClick={() => !answered && moveToSentence(word)}
                disabled={answered}
                className="px-4 py-2 rounded-xl border-2 border-border bg-surface text-text font-medium text-base transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Standard options for MULTIPLE_CHOICE / TRANSLATION / FILL_BLANK / LISTENING */
        <div className={`${isFillBlank ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
          {options.map((option) => {
            const isSelected = selected === option
            const isCorrectOption = option === correctAnswer
            const btnStyle = (() => {
              if (answered) {
                if (isCorrectOption) return "border-success bg-success/10 text-success shadow-[0_0_0_3px_rgba(0,168,132,0.15)]"
                if (isSelected && !isCorrectOption) return "border-error bg-error/10 text-error shadow-[0_0_0_3px_rgba(255,75,75,0.15)]"
                return "border-border bg-surface/30 text-text-muted"
              }
              if (isSelected) return "border-primary bg-primary/10 text-primary shadow-[0_3px_0_#58A700]"
              return "border-border bg-surface text-text hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
            })()
            return (
              <button
                key={option}
                onClick={() => !answered && setSelected(option)}
                className={`w-full py-4 px-6 rounded-2xl border-[3px] text-left text-lg font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer ${btnStyle}`}
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
      )}

      {/* Feedback */}
      {answered && isFreeForm && (
        <div className="text-center animate-slide-up space-y-2">
          {correct ? (
            <p className="text-sm font-bold text-success">✓ ¡Correcto!</p>
          ) : (
            <div>
              <p className="text-sm font-bold text-error">✗ incorrecto</p>
              <p className="text-sm text-text-muted mt-1">
                respuesta correcta: <span className="font-bold text-success">{correctAnswer}</span>
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                tu respuesta: {inputValue.trim()}
              </p>
            </div>
          )}
        </div>
      )}
      {answered && isOrdering && (
        <div className="text-center animate-slide-up space-y-2">
          {correct ? (
            <p className="text-sm font-bold text-success">✓ ¡Correcto!</p>
          ) : (
            <div>
              <p className="text-sm font-bold text-error">✗ incorrecto</p>
              <p className="text-sm text-text-muted mt-1">
                orden correcto: <span className="font-bold text-success">{correctAnswer}</span>
              </p>
            </div>
          )}
        </div>
      )}
      {answered && !isFreeForm && !isOrdering && correct === false && (
        <div className="animate-slide-up">
          <p className="text-sm text-center text-text-muted bg-error/5 p-3 rounded-xl border border-error/20">
            respuesta correcta: <span className="font-bold text-success">{correctAnswer}</span>
          </p>
        </div>
      )}
      {answered && !isFreeForm && !isOrdering && correct === true && (
        <div className="text-center animate-slide-up">
          <p className="text-sm font-bold text-success">✓ ¡Correcto!</p>
        </div>
      )}

      {/* Confirm / Next button */}
      <div className="pt-2">
        <button
          onClick={answered && correct === false ? handleNext : handleConfirm}
          disabled={answered && correct === false ? false : !isAnswerReady()}
          className="duo-btn duo-btn-primary w-full text-lg uppercase tracking-wide"
        >
          {answered && correct === false ? "siguiente →" : answered ? "siguiente →" : "confirmar"}
        </button>
      </div>
    </div>
  )
}

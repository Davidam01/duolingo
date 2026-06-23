"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { languages } from "@/lib/languages"

export function LanguageChanger({ currentLanguage }: { currentLanguage: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleChange(language: string) {
    if (language === currentLanguage) {
      setIsOpen(false)
      return
    }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/onboarding/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, skipOnboarding: true }),
      })
      if (!res.ok) throw new Error("Error al cambiar idioma")
      router.refresh()
      setIsOpen(false)
    } catch {
      setError("Error al cambiar idioma")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-text-muted hover:text-primary transition-colors"
      >
        <span>✏️</span>
        <span>cambiar idioma</span>
      </button>

      {isOpen && (
        <div className="space-y-1.5 animate-slide-up">
          <div className="grid grid-cols-2 gap-1.5">
            {languages.map((lang) => {
              const isSelected = lang.code === currentLanguage
              return (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  disabled={saving || isSelected}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all duration-200 ${
                    isSelected
                      ? "border-primary/40 bg-primary/5 text-primary font-semibold"
                      : "border-border bg-surface text-text hover:border-primary/30 hover:bg-primary/[0.02]"
                  } disabled:opacity-50 disabled:cursor-default`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              )
            })}
          </div>
          {saving && <p className="text-xs text-text-muted animate-pulse-soft">guardando...</p>}
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CourseItem {
  id: string
  language: string
  title: string
  level: string
  image: string | null
  flag: string
}

export function LanguageSelector({ courses }: { courses: CourseItem[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!selected) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/onboarding/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selected }),
      })
      if (!res.ok) {
        throw new Error("Error al guardar idioma")
      }
      router.push("/")
    } catch {
      setError("Error al guardar. Intenta de nuevo.")
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {courses.map((course) => {
          const isSelected = selected === course.language
          return (
            <button
              key={course.id}
              onClick={() => setSelected(course.language)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-text hover:border-primary/50"
              }`}
            >
              <span className="text-3xl">{course.flag}</span>
              <div className="flex-1">
                <p className="font-bold text-lg">{course.title}</p>
                <p className="text-sm text-text-muted">Nivel {course.level}</p>
              </div>
              {isSelected && (
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      {courses.length === 0 && (
        <p className="text-text-muted py-8">No hay cursos disponibles</p>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20" role="alert">
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selected || saving}
        className="duo-btn duo-btn-primary w-full text-lg uppercase tracking-wide"
      >
        {saving ? "Guardando..." : "Empezar a aprender"}
      </button>
    </div>
  )
}

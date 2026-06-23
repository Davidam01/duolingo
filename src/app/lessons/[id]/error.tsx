"use client"

import Link from "next/link"

export default function LessonsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center space-y-4">
      <h2 className="text-2xl font-bold text-text">Error al cargar la lección</h2>
      <p className="text-text-muted">No pudimos cargar los ejercicios.</p>
      {error.message && (
        <p className="text-xs text-text-muted/60 max-w-xs">{error.message}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="py-2 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/learn"
          className="py-2 px-6 border border-border text-text hover:bg-border/30 font-bold rounded-xl transition-colors"
        >
          Volver
        </Link>
      </div>
    </div>
  )
}

"use client"

export default function LeaderboardError({ reset }: { reset: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center space-y-4">
      <h2 className="text-2xl font-bold text-text">Error al cargar clasificación</h2>
      <p className="text-text-muted">Vuelve a intentarlo más tarde.</p>
      <button
        onClick={reset}
        className="py-2 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}

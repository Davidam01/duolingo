import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clasificación",
  description: "Ranking semanal de los mejores estudiantes",
}

export default function LeaderboardPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <h2 className="text-2xl font-bold text-text mb-4">Clasificación semanal</h2>
      <p className="text-text-muted">Compite con otros estudiantes. Aquí verás el ranking.</p>
    </div>
  )
}

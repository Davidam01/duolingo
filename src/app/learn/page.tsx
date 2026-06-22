import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aprender",
  description: "Continúa tus lecciones y mejora tu idioma",
}

export default function LearnPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <h2 className="text-2xl font-bold text-text mb-4">Tus lecciones</h2>
      <p className="text-text-muted">Aquí aparecerán tus lecciones disponibles.</p>
    </div>
  )
}

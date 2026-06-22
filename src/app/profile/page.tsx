import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Perfil",
  description: "Tu progreso, estadísticas y logros",
}

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <h2 className="text-2xl font-bold text-text mb-4">Tu perfil</h2>
      <p className="text-text-muted">Estadísticas, rachas y logros aparecerán aquí.</p>
    </div>
  )
}

import { auth } from "@/lib/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function Navbar() {
  const session = await auth()

  let xp = 0
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true },
    })
    xp = user?.xp ?? 0
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border" aria-label="Navegación principal">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Duolingo
        </Link>

        {session ? (
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/learn" className="text-text-muted hover:text-text transition-colors">
              Aprender
            </Link>
            <Link href="/leaderboard" className="text-text-muted hover:text-text transition-colors">
              Clasificación
            </Link>
            <Link href="/profile" className="text-text-muted hover:text-text transition-colors">
              Perfil
            </Link>
            <span className="text-accent font-bold text-sm bg-accent/10 px-3 py-1 rounded-full">
              ✨ {xp} XP
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="text-text-muted hover:text-text transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="py-2 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

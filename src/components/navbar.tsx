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
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border" aria-label="Navegación principal">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href={session ? "/learn" : "/"} className="flex items-center gap-2 text-xl font-bold font-display text-primary">
          <span>🦉</span>
          <span>Duolingo</span>
        </Link>

        {session ? (
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/learn"
              className="text-text-muted hover:text-text transition-colors px-3 py-2 rounded-xl hover:bg-surface-alt"
            >
              Aprender
            </Link>
            <Link
              href="/leaderboard"
              className="text-text-muted hover:text-text transition-colors px-3 py-2 rounded-xl hover:bg-surface-alt"
            >
              Clasificación
            </Link>
            <Link
              href="/profile"
              className="text-text-muted hover:text-text transition-colors px-3 py-2 rounded-xl hover:bg-surface-alt"
            >
              Perfil
            </Link>
            <span className="flex items-center gap-1.5 text-accent font-bold text-sm bg-accent/10 px-3 py-1.5 rounded-full">
              <span>✨</span>
              <span>{xp} XP</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/login"
              className="px-4 py-2 text-text-muted hover:text-text transition-colors rounded-xl hover:bg-surface-alt"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all hover:shadow-md active:scale-[0.97]"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

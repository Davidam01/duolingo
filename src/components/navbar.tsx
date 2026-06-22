import Link from "next/link"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border" aria-label="Navegación principal">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Duolingo
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-text-muted">
          <Link href="/learn" className="hover:text-text transition-colors">
            Aprender
          </Link>
          <Link href="/leaderboard" className="hover:text-text transition-colors">
            Clasificación
          </Link>
          <Link href="/profile" className="hover:text-text transition-colors">
            Perfil
          </Link>
        </div>
      </div>
    </nav>
  )
}

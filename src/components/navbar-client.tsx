"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface NavbarClientProps {
  session: { user?: { id?: string; name?: string | null; email?: string | null; image?: string | null; onboardingComplete?: boolean } } | null
  xp: number
}

const links = [
  { href: "/learn", label: "Aprender", icon: "🦉" },
  { href: "/leaderboard", label: "Clasificación", icon: "🏆" },
  { href: "/profile", label: "Perfil", icon: "👤" },
]

export function NavbarClient({ session, xp }: NavbarClientProps) {
  const pathname = usePathname()

  if (!session) {
    return (
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border" aria-label="Navegación principal">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-display text-primary hover:text-primary-hover transition-colors">
            <span aria-hidden>🦉</span>
            <span className="hidden sm:inline">duolingo</span>
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link href="/login" className="px-4 py-2 text-text-muted hover:text-text transition-colors rounded-xl hover:bg-surface-alt">
              iniciar sesión
            </Link>
            <Link href="/register" className="px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-[0_3px_0_#58A700] hover:shadow-[0_1px_0_#58A700] hover:translate-y-[2px] transition-all active:translate-y-[3px] uppercase tracking-wide text-sm">
              registrarse
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border hidden md:block" aria-label="Navegación principal">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          <Link href="/learn" className="flex items-center gap-2 text-xl font-bold font-display text-primary hover:text-primary-hover transition-colors">
            <span aria-hidden>🦉</span>
            <span>duolingo</span>
          </Link>

          <div className="flex items-center gap-1 text-sm font-medium">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  isActive(href)
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-text-muted hover:text-text hover:bg-surface-alt"
                }`}
              >
                {label}
              </Link>
            ))}
            <span className="flex items-center gap-1.5 text-accent font-bold text-sm bg-accent/10 px-3 py-1.5 rounded-full ml-2">
              <span aria-hidden>✨</span>
              <span>{xp} XP</span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2 p-2 text-text-muted hover:text-error transition-colors rounded-xl hover:bg-error/5"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border md:hidden" aria-label="Navegación inferior">
        <div className="flex items-center justify-around h-16 px-2">
          {links.map(({ href, label, icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-text-muted hover:text-text"
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-primary" : ""}`}>
                  {label}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-xl text-text-muted hover:text-error transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">salir</span>
          </button>
        </div>
      </nav>
    </>
  )
}

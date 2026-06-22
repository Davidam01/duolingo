"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface NavbarClientProps {
  session: { user?: { id?: string; name?: string | null; email?: string | null; image?: string | null } } | null
  xp: number
}

const links = [
  { href: "/learn", label: "Aprender" },
  { href: "/leaderboard", label: "Clasificación" },
  { href: "/profile", label: "Perfil" },
]

export function NavbarClient({ session, xp }: NavbarClientProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border" aria-label="Navegación principal">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        <Link
          href={session ? "/learn" : "/"}
          className="flex items-center gap-2 text-xl font-bold font-display text-primary hover:text-primary-hover transition-colors"
        >
          <span aria-hidden>🦉</span>
          <span className="hidden sm:inline">Duolingo</span>
        </Link>

        {session ? (
          <>
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              {links.map(({ href, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2 rounded-xl transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-text-muted hover:text-text hover:bg-surface-alt"
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
              <span className="flex items-center gap-1.5 text-accent font-bold text-sm bg-accent/10 px-3 py-1.5 rounded-full ml-2">
                <span aria-hidden>✨</span>
                <span>{xp} XP</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 px-3 py-2 text-text-muted hover:text-error transition-colors rounded-xl hover:bg-error/5"
                title="Cerrar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text transition-colors"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute top-14 left-0 right-0 bg-surface border-b border-border shadow-lg md:hidden animate-fade-in-up">
                <div className="flex flex-col p-4 space-y-1">
                  {links.map(({ href, label }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/")
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={`px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-alt"
                        }`}
                      >
                        {label}
                      </Link>
                    )
                  })}
                  <div className="flex items-center justify-between px-3 py-3">
                    <span className="flex items-center gap-1.5 text-accent font-bold text-sm">
                      <span aria-hidden>✨</span>
                      <span>{xp} XP</span>
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-sm text-text-muted hover:text-error transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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

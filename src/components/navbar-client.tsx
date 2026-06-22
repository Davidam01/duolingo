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
      {/* Desktop Nav */}
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border hidden md:block" aria-label="Navegación principal">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link href="/learn" className="flex items-center gap-2 text-xl font-bold font-display text-primary hover:text-primary-hover transition-all hover:scale-105 active:scale-95">
            <span aria-hidden>🦉</span>
            <span>duolingo</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1 text-sm font-medium relative">
            {links.map(({ href, label }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? "text-primary font-bold"
                      : "text-text-muted hover:text-text hover:bg-surface-alt"
                  }`}
                >
                  {label}
                  {/* Active indicator underline */}
                  {active && (
                    <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-primary rounded-full animate-fade-in" />
                  )}
                </Link>
              )
            })}

            {/* XP Counter */}
            <span className="flex items-center gap-1.5 text-accent font-bold text-sm bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 px-3 py-1.5 rounded-full ml-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <span className="group-hover:scale-110 transition-transform duration-200" aria-hidden>✨</span>
              <span key={xp} className="tabular-nums animate-count-up">{xp}</span>
              <span className="text-accent/60 text-xs">XP</span>
            </span>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2 p-2 text-text-muted hover:text-error transition-all duration-200 rounded-xl hover:bg-error/5 hover:scale-110 active:scale-95"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border md:hidden pb-safe" aria-label="Navegación inferior">
        <div className="flex items-center justify-around h-16 px-2">
          {links.map(({ href, label, icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${
                  active
                    ? "text-primary"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {/* Active top bar indicator */}
                {active && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-scale-in" />
                )}
                <span className={`text-xl transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`}>
                  {icon}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  active ? "text-primary scale-105" : ""
                }`}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* Logout button on mobile */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="relative flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-xl text-text-muted hover:text-error transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">salir</span>
          </button>
        </div>
      </nav>
    </>
  )
}

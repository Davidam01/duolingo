"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

type AuthMode = "login" | "register"

export function AuthForm({ mode }: { mode: AuthMode }) {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState(searchParams.get("error") ?? "")
  const [loading, setLoading] = useState(false)
  const [hasGoogle, setHasGoogle] = useState(false)

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((providers) => setHasGoogle("google" in providers))
      .catch(() => setHasGoogle(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? "Error al registrar")
          setLoading(false)
          return
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (!result || result.error) {
        const errorKey = result?.error ?? "Unknown"
        const messages: Record<string, string> = {
          CredentialsSignin: "Email o contraseña incorrectos",
          Configuration: "Error de configuración del servidor",
          AccessDenied: "Acceso denegado",
          Unknown: "Error al iniciar sesión",
        }
        setError(messages[errorKey] ?? "Error al iniciar sesión")
        setLoading(false)
        return
      }

      // Use full page navigation to ensure session cookie is properly sent
      window.location.href = "/learn"
    } catch {
      setError("Error de conexión. Verifica que la base de datos esté funcionando.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "register" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-border bg-surface text-text placeholder:text-text-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Tu nombre"
            autoComplete="name"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}            className="w-full px-4 py-3.5 rounded-2xl border-2 border-border bg-surface text-text placeholder:text-text-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}            className="w-full px-4 py-3.5 rounded-2xl border-2 border-border bg-surface text-text placeholder:text-text-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="••••••••"
          minLength={6}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20" role="alert">
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="duo-btn duo-btn-primary w-full text-base uppercase tracking-wide"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando...
          </span>
        ) : mode === "login" ? (
          "Iniciar sesión"
        ) : (
          "Crear cuenta"
        )}
      </button>

      {hasGoogle && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-3 text-text-muted font-medium">O continúa con</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/learn" })}
            className="duo-btn duo-btn-secondary w-full gap-3"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </>
      )}
    </form>
  )
}

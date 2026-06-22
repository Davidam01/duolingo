import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Duolingo y empieza a aprender",
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="w-full max-w-sm">
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-card space-y-6">
          <div className="text-center space-y-1">
            <div className="text-4xl mb-2">🦉</div>
            <h1 className="text-2xl font-bold font-display text-text">Crear cuenta</h1>
            <p className="text-sm text-text-muted">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-secondary font-semibold hover:underline">
                Inicia sesión
              </a>
            </p>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse bg-border rounded-xl" />}>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Duolingo",
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-white to-background">
      <div className="w-full max-w-sm">
        <div className="bg-white border-2 border-border-light rounded-2xl p-8 space-y-6 shadow-md">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-1">🦉</div>
            <h1 className="text-2xl font-bold font-display text-text">iniciar sesión</h1>
            <p className="text-sm text-text-muted">
              ¿Nuevo?{" "}
              <a href="/register" className="text-secondary font-bold hover:underline">
                crea una cuenta
              </a>
            </p>
          </div>
          <Suspense fallback={<div className="h-64 rounded-2xl bg-border/50 animate-pulse" />}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Duolingo y empieza a aprender",
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-white to-background">
      <div className="w-full max-w-sm">
        <div className="bg-white border-2 border-border-light rounded-2xl p-8 space-y-6 shadow-md">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-1">🦉</div>
            <h1 className="text-2xl font-bold font-display text-text">crear cuenta</h1>
            <p className="text-sm text-text-muted">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-secondary font-bold hover:underline">
                inicia sesión
              </a>
            </p>
          </div>
          <Suspense fallback={<div className="h-64 rounded-2xl bg-border/50 animate-pulse" />}>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

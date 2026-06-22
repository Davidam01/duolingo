import type { Metadata } from "next"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Duolingo",
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text">Iniciar sesión</h1>
          <p className="text-text-muted text-sm">
            ¿Nuevo?{" "}
            <a href="/register" className="text-secondary underline hover:no-underline">
              Crea una cuenta
            </a>
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  )
}

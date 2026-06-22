import type { Metadata } from "next"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Duolingo y empieza a aprender",
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text">Crear cuenta</h1>
          <p className="text-text-muted text-sm">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-secondary underline hover:no-underline">
              Inicia sesión
            </a>
          </p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  )
}

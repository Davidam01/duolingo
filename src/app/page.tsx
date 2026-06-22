import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/learn")

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-white to-background">
      <div className="max-w-sm w-full text-center space-y-10">
        {/* Hero */}
        <div className="space-y-6">
          <div className="text-7xl animate-bounce-in">🦉</div>
          <h1 className="text-4xl font-bold font-display text-text leading-tight">
            aprende un idioma{" "}
            <span className="text-primary">gratis</span>
          </h1>
          <p className="text-base text-text-muted leading-relaxed max-w-xs mx-auto">
            Lecciones divertidas, efectivas y completamente gratis.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href="/register"
            className="duo-btn duo-btn-primary w-full text-lg uppercase tracking-wide"
          >
            Empezar ahora
          </Link>
          <Link
            href="/login"
            className="duo-btn duo-btn-secondary w-full font-bold"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "10M+", label: "estudiantes" },
            { value: "30+", label: "idiomas" },
            { value: "100%", label: "gratis" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border-2 border-border-light p-3 shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-xl font-bold font-display text-primary">
                {stat.value}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

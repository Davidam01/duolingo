import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/learn")

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden relative">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] text-3xl opacity-10 animate-float" style={{ animationDelay: "0s" }}>🌟</div>
        <div className="absolute top-[20%] right-[8%] text-2xl opacity-10 animate-float" style={{ animationDelay: "1s" }}>✨</div>
        <div className="absolute bottom-[30%] left-[10%] text-2xl opacity-10 animate-float" style={{ animationDelay: "2s" }}>💫</div>
        <div className="absolute bottom-[20%] right-[5%] text-3xl opacity-10 animate-float" style={{ animationDelay: "0.5s" }}>⭐</div>
      </div>

      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="text-7xl animate-bounce-in">🦉</div>
          <h1 className="text-5xl font-bold font-display text-text leading-tight">
            Aprende un idioma
          </h1>
          <p className="text-xl text-text-muted max-w-xs mx-auto leading-relaxed">
            Lecciones divertidas, cortas y gamificadas.{" "}
            <span className="text-primary font-semibold">Gratis para siempre.</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "10M+", label: "estudiantes", delay: 0 },
            { value: "30+", label: "idiomas", delay: 100 },
            { value: "100%", label: "gratis", delay: 200 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-slide-up group"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <p className="text-2xl font-bold font-display text-primary group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            href="/register"
            className="block w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] hover:-translate-y-0.5"
          >
            Empezar a aprender
          </Link>
          <Link
            href="/login"
            className="block w-full py-3.5 px-6 border-2 border-border text-text font-bold rounded-2xl text-lg transition-all hover:bg-surface hover:border-primary/30 active:scale-[0.98] hover:-translate-y-0.5"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}

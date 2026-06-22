import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/learn")

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-md w-full text-center space-y-10">
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
            { value: "10M+", label: "estudiantes" },
            { value: "30+", label: "idiomas" },
            { value: "100%", label: "gratis" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-2xl bg-surface border border-border">
              <p className="text-2xl font-bold font-display text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            href="/register"
            className="block w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Empezar a aprender
          </Link>
          <Link
            href="/login"
            className="block w-full py-3.5 px-6 border-2 border-border text-text font-bold rounded-2xl text-lg transition-all hover:bg-surface hover:border-primary/30 active:scale-[0.98]"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-text">
          Aprende un idioma hoy
        </h1>
        <p className="text-lg text-text-muted">
          Lecciones divertidas, cortas y gamificadas. Gratis para siempre.
        </p>
        <div className="space-y-3">
          <Link
            href="/learn"
            className="block w-full py-3 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-lg transition-colors shadow-md"
          >
            Empezar a aprender
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 px-6 border-2 border-border text-text font-bold rounded-2xl text-lg transition-colors hover:bg-surface-alt"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}

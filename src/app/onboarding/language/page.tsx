import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LanguageSelector } from "./language-selector"

export const metadata: Metadata = {
  title: "¿Qué quieres aprender?",
  description: "Elige el idioma que quieres aprender",
}

const flags: Record<string, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  de: "🇩🇪",
  it: "🇮🇹",
  pt: "🇵🇹",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
  ru: "🇷🇺",
  ar: "🇸🇦",
}

export default async function OnboardingLanguagePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingComplete: true },
  })
  if (user?.onboardingComplete) redirect("/learn")

  const courses = await prisma.course.findMany({
    select: { id: true, language: true, title: true, level: true, image: true },
    orderBy: { order: "asc" },
  })

  const coursesWithFlags = courses.map((c) => ({
    ...c,
    flag: flags[c.language] ?? "🌍",
  }))

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-white to-background">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-2">
          <div className="text-5xl animate-bounce-in">🦉</div>
          <h1 className="text-3xl font-bold font-display text-text">
            ¿qué te gustaría aprender?
          </h1>
          <p className="text-text-muted">
            Elige un curso y empieza tu aventura
          </p>
        </div>
        <LanguageSelector courses={coursesWithFlags} />
      </div>
    </div>
  )
}

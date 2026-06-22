import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Aprender",
  description: "Tus lecciones y progreso",
}

export default async function LearnPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const courses = await prisma.course.findMany({
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              exercises: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  })

  const completedExercises = await prisma.progress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { exerciseId: true },
  })
  const completedSet = new Set(completedExercises.map((p) => p.exerciseId))

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        {courses.map((course) => (
          <div key={course.id}>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold font-display text-text">
                {course.title.toLowerCase()}
              </h1>
              <p className="text-sm text-text-muted">{course.description}</p>
            </div>

            {course.sections.map((section) => {
              const totalEx = section.lessons.reduce((a, l) => a + l.exercises.length, 0)
              const doneEx = section.lessons.reduce(
                (a, l) => a + l.exercises.filter((e) => completedSet.has(e.id)).length, 0,
              )

              return (
                <div key={section.id} className="space-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">
                      {section.title}
                    </h2>
                    <span className="text-xs text-text-muted">
                      {doneEx}/{totalEx}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(doneEx / totalEx) * 100}%` }}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-[23px] top-3 bottom-3 w-0.5 bg-border" />

                    <div className="space-y-6">
                      {section.lessons.map((lesson, idx) => {
                        const allDone = lesson.exercises.every((e) => completedSet.has(e.id))
                        const started = lesson.exercises.some((e) => completedSet.has(e.id))
                        const isFirstIncomplete = !allDone && !started && (idx === 0 || section.lessons.slice(0, idx).every((l) =>
                          l.exercises.every((e) => completedSet.has(e.id)),
                        ))
                        const isActive = started && !allDone

                        let nodeStyle = "bg-border border-border"
                        let ringStyle = ""
                        let label = (idx + 1).toString()

                        if (allDone) {
                          nodeStyle = "bg-accent border-accent text-white"
                          label = "✓"
                        } else if (isActive || isFirstIncomplete) {
                          nodeStyle = "bg-primary border-primary text-white shadow-[0_0_0_4px_rgba(88,204,2,0.2)]"
                          ringStyle = "animate-ping absolute inset-0 rounded-full bg-primary/30"
                        }

                        return (
                          <Link
                            key={lesson.id}
                            href={`/lessons/${lesson.id}`}
                            className="flex items-center gap-4 group"
                          >
                            <div className="relative shrink-0">
                              <div
                                className={`relative w-[46px] h-[46px] rounded-full border-[3px] flex items-center justify-center text-sm font-bold transition-all ${nodeStyle} group-hover:scale-110`}
                              >
                                {label}
                                {ringStyle && <div className={ringStyle} />}
                              </div>
                            </div>

                            <div className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                              allDone
                                ? "border-accent/30 bg-accent/[0.03]"
                                : isActive || isFirstIncomplete
                                  ? "border-primary/40 bg-primary/[0.03] shadow-sm"
                                  : "border-border bg-surface opacity-60"
                            }`}>
                              <p className={`font-bold ${allDone ? "text-accent" : isActive || isFirstIncomplete ? "text-text" : "text-text-muted"}`}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-text-muted">
                                {lesson.exercises.length} ejercicios
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

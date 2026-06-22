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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {courses.map((course) => (
        <div key={course.id}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-text">{course.title}</h1>
            <p className="text-text-muted">{course.description}</p>
          </div>

          {course.sections.map((section) => {
            const sectionExercises = section.lessons.reduce(
              (acc, l) => acc + l.exercises.length, 0,
            )
            const completedSection = section.lessons.reduce(
              (acc, l) =>
                acc + l.exercises.filter((e) => completedSet.has(e.id)).length, 0,
            )

            return (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text">Sección {section.order}</h2>
                  <span className="text-sm text-text-muted">
                    {completedSection}/{sectionExercises}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(completedSection / sectionExercises) * 100}%` }}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  {section.lessons.map((lesson) => {
                    const done = lesson.exercises.every((e) => completedSet.has(e.id))
                    const started = lesson.exercises.some((e) => completedSet.has(e.id))

                    return (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.id}`}
                      >
                        <div
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:border-primary ${
                            done
                              ? "border-success bg-success/5"
                              : started
                                ? "border-secondary bg-secondary/5"
                                : "border-border bg-surface"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                              done
                                ? "bg-success text-white"
                                : started
                                  ? "bg-secondary text-white"
                                  : "bg-surface-alt text-text-muted"
                            }`}
                          >
                            {done ? "✓" : lesson.order}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-text">{lesson.title}</p>
                            <p className="text-sm text-text-muted">
                              {lesson.exercises.length} ejercicios
                            </p>
                          </div>
                          <span className="text-text-muted">→</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

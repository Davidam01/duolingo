import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const course = await prisma.course.create({
    data: {
      title: "Inglés",
      description: "Curso completo de inglés desde cero",
      language: "en",
      level: "A1",
      order: 1,
      sections: {
        create: [
          {
            title: "Conceptos básicos",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Saludos",
                  order: 1,
                  exercises: {
                    create: [
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Cómo se dice 'Hola' en inglés?",
                        options: JSON.stringify(["Hello", "Goodbye", "Thanks", "Please"]),
                        answer: "Hello",
                      },
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Cómo se dice 'Gracias' en inglés?",
                        options: JSON.stringify(["Hello", "Goodbye", "Thanks", "Please"]),
                        answer: "Thanks",
                      },
                      {
                        type: "TRANSLATION",
                        question: "Traduce: 'Good morning'",
                        options: JSON.stringify(["Buenos días", "Buenas noches", "Hola", "Adiós"]),
                        answer: "Buenos días",
                      },
                      {
                        type: "FILL_BLANK",
                        question: "Completa: '___ are you?'",
                        options: JSON.stringify(["How", "What", "Where", "Who"]),
                        answer: "How",
                      },
                    ],
                  },
                },
                {
                  title: "Números",
                  order: 2,
                  exercises: {
                    create: [
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Cómo se dice 'One' en español?",
                        options: JSON.stringify(["Uno", "Dos", "Tres", "Cinco"]),
                        answer: "Uno",
                      },
                      {
                        type: "TRANSLATION",
                        question: "Traduce: 'Three cats'",
                        options: JSON.stringify(["Tres gatos", "Dos gatos", "Cinco gatos", "Un gato"]),
                        answer: "Tres gatos",
                      },
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Qué número es 'Ten'?",
                        options: JSON.stringify(["10", "5", "20", "100"]),
                        answer: "10",
                      },
                    ],
                  },
                },
                {
                  title: "Colores",
                  order: 3,
                  exercises: {
                    create: [
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Cómo se dice 'Red' en español?",
                        options: JSON.stringify(["Rojo", "Azul", "Verde", "Amarillo"]),
                        answer: "Rojo",
                      },
                      {
                        type: "FILL_BLANK",
                        question: "Completa: 'The sky is ___' (azul)",
                        options: JSON.stringify(["blue", "red", "green", "yellow"]),
                        answer: "blue",
                      },
                      {
                        type: "TRANSLATION",
                        question: "Traduce: 'Black cat'",
                        options: JSON.stringify(["Gato negro", "Gato blanco", "Perro negro", "Gato gris"]),
                        answer: "Gato negro",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Frases útiles",
            order: 2,
            lessons: {
              create: [
                {
                  title: "En el restaurante",
                  order: 1,
                  exercises: {
                    create: [
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Cómo pides un café en inglés?",
                        options: JSON.stringify([
                          "I'd like a coffee",
                          "I want coffee",
                          "Give me coffee",
                          "Coffee now",
                        ]),
                        answer: "I'd like a coffee",
                      },
                      {
                        type: "TRANSLATION",
                        question: "Traduce: 'The bill, please'",
                        options: JSON.stringify(["La cuenta, por favor", "La mesa, por favor", "El menú, gracias", "Agua, por favor"]),
                        answer: "La cuenta, por favor",
                      },
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Cómo dices 'Está delicioso'?",
                        options: JSON.stringify(["It's delicious", "It's horrible", "It's cold", "It's spicy"]),
                        answer: "It's delicious",
                      },
                    ],
                  },
                },
                {
                  title: "Direcciones",
                  order: 2,
                  exercises: {
                    create: [
                      {
                        type: "MULTIPLE_CHOICE",
                        question: "¿Cómo preguntas por una dirección?",
                        options: JSON.stringify([
                          "Where is the station?",
                          "What is the station?",
                          "Who is at the station?",
                          "When is the station?",
                        ]),
                        answer: "Where is the station?",
                      },
                      {
                        type: "FILL_BLANK",
                        question: "Completa: 'Turn ___ at the corner' (izquierda)",
                        options: JSON.stringify(["left", "right", "straight", "back"]),
                        answer: "left",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  })

  console.log(`Curso creado: ${course.title}`)
  console.log(`${course.sections.length} secciones`)
  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0)
  console.log(`${totalLessons} lecciones`)
  const totalExercises = course.sections.reduce(
    (acc, s) => acc + s.lessons.reduce((a, l) => a + l.exercises.length, 0),
    0,
  )
  console.log(`${totalExercises} ejercicios`)

  const achievements = await prisma.achievement.createMany({
    data: [
      {
        type: "STREAK",
        title: "Racha de 3 días",
        description: "Practica 3 días seguidos",
        icon: "🔥",
        threshold: 3,
      },
      {
        type: "STREAK",
        title: "Racha de 7 días",
        description: "Practica 7 días seguidos",
        icon: "🔥",
        threshold: 7,
      },
      {
        type: "STREAK",
        title: "Racha de 30 días",
        description: "Un mes de aprendizaje constante",
        icon: "🔥",
        threshold: 30,
      },
      {
        type: "STREAK",
        title: "Racha de 100 días",
        description: "¡100 días seguidos!",
        icon: "💪",
        threshold: 100,
      },
      {
        type: "STREAK",
        title: "Racha de 365 días",
        description: "¡Un año entero!",
        icon: "🏅",
        threshold: 365,
      },
      {
        type: "XP_MILESTONE",
        title: "Principiante",
        description: "Alcanza 100 XP",
        icon: "⭐",
        threshold: 100,
      },
      {
        type: "XP_MILESTONE",
        title: "Aprendiz",
        description: "Alcanza 500 XP",
        icon: "🌟",
        threshold: 500,
      },
      {
        type: "XP_MILESTONE",
        title: "Experto",
        description: "Alcanza 1000 XP",
        icon: "🏆",
        threshold: 1000,
      },
      {
        type: "XP_MILESTONE",
        title: "Maestro",
        description: "Alcanza 5000 XP",
        icon: "👑",
        threshold: 5000,
      },
      {
        type: "XP_MILESTONE",
        title: "Leyenda",
        description: "Alcanza 10000 XP",
        icon: "💎",
        threshold: 10000,
      },
      {
        type: "LESSONS_COMPLETED",
        title: "Primera lección",
        description: "Completa tu primera lección",
        icon: "📚",
        threshold: 1,
      },
      {
        type: "LESSONS_COMPLETED",
        title: "Cinco lecciones",
        description: "Completa 5 lecciones",
        icon: "📚",
        threshold: 5,
      },
      {
        type: "LESSONS_COMPLETED",
        title: "Dedicación",
        description: "Completa 10 lecciones",
        icon: "🎯",
        threshold: 10,
      },
      {
        type: "LESSONS_COMPLETED",
        title: "Entusiasta",
        description: "Completa 25 lecciones",
        icon: "🎓",
        threshold: 25,
      },
      {
        type: "LESSONS_COMPLETED",
        title: "Devoto",
        description: "Completa 50 lecciones",
        icon: "🏅",
        threshold: 50,
      },
      {
        type: "PERFECT_LESSON",
        title: "Perfecto",
        description: "Completa una lección sin errores",
        icon: "✨",
        threshold: 1,
      },
      {
        type: "PERFECT_LESSON",
        title: "Impecable",
        description: "Completa 5 lecciones perfectas",
        icon: "💫",
        threshold: 5,
      },
      {
        type: "PERFECT_LESSON",
        title: "Maestría",
        description: "Completa 10 lecciones perfectas",
        icon: "🌟",
        threshold: 10,
      },
    ],
  })

  console.log(`${achievements.count} logros creados`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })

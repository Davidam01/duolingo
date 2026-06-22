/**
 * @jest-environment node
 *
 * Integration tests for API routes with a real SQLite database.
 *
 * Creates a temporary test.db (already in .gitignore), pushes the Prisma schema,
 * seeds test data, tests all route handlers (lessons, progress, achievements,
 * leaderboard), and cleans up after.
 */

// --- Database setup (runs at module load, BEFORE jest.mock factories execute) ---
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

const TEST_DB_PATH = path.join(process.cwd(), "test.db")

try {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH)
  }
  execSync("npx prisma db push --accept-data-loss", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "pipe",
  })
} catch (err) {
  console.error("Failed to set up test database. Ensure Prisma CLI and schema are valid.", String(err))
  throw err
}

// --- Mocks (hoisted to top by Jest, factories execute lazily on first require) ---
let testPrismaClient: import("@prisma/client").PrismaClient | null = null

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}))

jest.mock("@/lib/prisma", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
  const adapter = new PrismaBetterSqlite3({ url: "file:./test.db" })
  testPrismaClient = new PrismaClient({ adapter })
  return { prisma: testPrismaClient }
})

// --- Imports (evaluated AFTER module-level code, triggering mock factories) ---
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GET as getLessons } from "@/app/api/lessons/route"
import { POST as completeLesson } from "@/app/api/lessons/complete/route"
import { GET as getProgress, POST as saveProgress } from "@/app/api/progress/route"
import { POST as verifyAchievements } from "@/app/api/achievements/route"
import { GET as getLeaderboard } from "@/app/api/leaderboard/route"

// --- Test data constants ---
const TEST_USER_ID = "test-user-1"
const OTHER_USER_ID = "test-user-2"

const INITIAL_USER_STATE = {
  id: TEST_USER_ID,
  name: "Test User",
  email: "test@test.com",
  xp: 50,
  streak: 2,
  lessonsCompleted: 0,
  perfectLessons: 0,
  onboardingComplete: true,
  learningLanguage: "en",
}

const OTHER_USER = {
  id: OTHER_USER_ID,
  name: "Other User",
  email: "other@test.com",
  xp: 150,
}

let exerciseIds: string[] = []

async function seedTestData() {
  await prisma.user.create({ data: INITIAL_USER_STATE })
  await prisma.user.create({ data: OTHER_USER })

  const course = await prisma.course.create({
    data: {
      title: "Test Course",
      language: "en",
      level: "A1",
      order: 1,
      sections: {
        create: {
          title: "Test Section",
          order: 1,
          lessons: {
            create: [
              {
                title: "Lesson 1",
                order: 1,
                exercises: {
                  create: [
                    { type: "MULTIPLE_CHOICE", question: "Test Q1?", options: JSON.stringify(["A", "B", "C", "D"]), answer: "A" },
                    { type: "TRANSLATION", question: "Translate test", options: JSON.stringify(["X", "Y", "Z"]), answer: "X" },
                    { type: "FILL_BLANK", question: "Fill ___ blank", options: JSON.stringify(["the", "a", "an"]), answer: "the" },
                    { type: "MULTIPLE_CHOICE", question: "Test Q2?", options: JSON.stringify(["1", "2", "3", "4"]), answer: "2" },
                  ],
                },
              },
              {
                title: "Lesson 2",
                order: 2,
                exercises: {
                  create: [
                    { type: "MULTIPLE_CHOICE", question: "Another?", options: JSON.stringify(["Yes", "No"]), answer: "Yes" },
                    { type: "TRANSLATION", question: "Translate: Hello", options: JSON.stringify(["Hola", "Adiós"]), answer: "Hola" },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    include: {
      sections: { include: { lessons: { include: { exercises: true } } } },
    },
  })

  exerciseIds = course.sections[0].lessons.flatMap((l) =>
    l.exercises.map((e) => e.id),
  )

  await prisma.achievement.createMany({
    data: [
      { type: "XP_MILESTONE", title: "100 XP", threshold: 100, icon: "⭐" },
      { type: "STREAK", title: "3 Days", threshold: 3, icon: "🔥" },
      { type: "LESSONS_COMPLETED", title: "First Lesson", threshold: 1, icon: "📚" },
      { type: "PERFECT_LESSON", title: "Perfect!", threshold: 1, icon: "✨" },
      { type: "XP_MILESTONE", title: "500 XP", threshold: 500, icon: "🌟" },
    ],
  })
}

async function resetTestUserState() {
  await prisma.user.update({
    where: { id: TEST_USER_ID },
    data: {
      xp: INITIAL_USER_STATE.xp,
      streak: INITIAL_USER_STATE.streak,
      lessonsCompleted: INITIAL_USER_STATE.lessonsCompleted,
      perfectLessons: INITIAL_USER_STATE.perfectLessons,
      lastActivity: null,
    },
  })
  await prisma.progress.deleteMany({ where: { userId: TEST_USER_ID } })
  await prisma.userAchievement.deleteMany({ where: { userId: TEST_USER_ID } })
}

async function resetAllData() {
  await prisma.$executeRawUnsafe("DELETE FROM user_achievements")
  await prisma.$executeRawUnsafe("DELETE FROM progress")
  await prisma.$executeRawUnsafe("DELETE FROM exercises")
  await prisma.$executeRawUnsafe("DELETE FROM lessons")
  await prisma.$executeRawUnsafe("DELETE FROM sections")
  await prisma.$executeRawUnsafe("DELETE FROM courses")
  await prisma.$executeRawUnsafe("DELETE FROM achievements")
  await prisma.$executeRawUnsafe("DELETE FROM leaderboard")
  await prisma.$executeRawUnsafe("DELETE FROM sessions")
  await prisma.$executeRawUnsafe("DELETE FROM accounts")
  await prisma.$executeRawUnsafe("DELETE FROM users")
}

function createRequest(url: string, init?: RequestInit): Request {
  return new Request(url, init)
}

// --- Setup & Teardown ---

beforeAll(async () => {
  await resetAllData()
  await seedTestData()
})

beforeEach(async () => {
  jest.clearAllMocks()
  ;(auth as jest.Mock).mockResolvedValue({
    user: { id: TEST_USER_ID, email: INITIAL_USER_STATE.email },
  })
  await resetTestUserState()
})

afterAll(async () => {
  await resetAllData()
  await prisma.$disconnect()

  try {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
    ;["-journal", "-wal", "-shm"].forEach((suffix) => {
      const p = TEST_DB_PATH + suffix
      if (fs.existsSync(p)) fs.unlinkSync(p)
    })
  } catch {
    // Ignore cleanup errors
  }
})

// =============================================
// GET /api/lessons
// =============================================
describe("GET /api/lessons", () => {
  it("returns 401 without auth", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const res = await getLessons()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("No autorizado")
  })

  it("returns all lessons ordered by order asc", async () => {
    const res = await getLessons()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.length).toBe(2)
    expect(body[0].title).toBe("Lesson 1")
    expect(body[1].title).toBe("Lesson 2")
  })

  it("includes exercises count per lesson", async () => {
    const res = await getLessons()
    const body = await res.json()
    expect(body[0].exercises.length).toBe(4)
    expect(body[1].exercises.length).toBe(2)
  })

  it("includes section and course info", async () => {
    const res = await getLessons()
    const body = await res.json()
    expect(body[0].section.title).toBe("Test Section")
    expect(body[0].section.course.title).toBe("Test Course")
  })
})

// =============================================
// POST /api/lessons/complete
// =============================================
describe("POST /api/lessons/complete", () => {
  it("returns 401 without auth", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const req = createRequest("http://localhost/api/lessons/complete", {
      method: "POST",
      body: JSON.stringify({ correct: 3, total: 3 }),
    })
    const res = await completeLesson(req)
    expect(res.status).toBe(401)
  })

  it("awards 100 XP for all correct (4/4)", async () => {
    const req = createRequest("http://localhost/api/lessons/complete", {
      method: "POST",
      body: JSON.stringify({ correct: 4, total: 4 }),
    })
    const res = await completeLesson(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.xp).toBe(100)

    const user = await prisma.user.findUnique({ where: { id: TEST_USER_ID } })
    expect(user!.xp).toBe(INITIAL_USER_STATE.xp + 100)
    expect(user!.lessonsCompleted).toBe(1)
    expect(user!.perfectLessons).toBe(1)
  })

  it("awards 50 XP for 2/4 correct", async () => {
    const req = createRequest("http://localhost/api/lessons/complete", {
      method: "POST",
      body: JSON.stringify({ correct: 2, total: 4 }),
    })
    const res = await completeLesson(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.xp).toBe(50)

    const user = await prisma.user.findUnique({ where: { id: TEST_USER_ID } })
    expect(user!.xp).toBe(INITIAL_USER_STATE.xp + 50)
    expect(user!.perfectLessons).toBe(0)
  })

  it("resets streak to 1 when gap > 1 day", async () => {
    await prisma.user.update({
      where: { id: TEST_USER_ID },
      data: { streak: 5, lastActivity: new Date(Date.now() - 86400000 * 3) },
    })
    const req = createRequest("http://localhost/api/lessons/complete", {
      method: "POST",
      body: JSON.stringify({ correct: 2, total: 2 }),
    })
    await completeLesson(req)
    const user = await prisma.user.findUnique({ where: { id: TEST_USER_ID } })
    expect(user!.streak).toBe(1)
  })

  it("triggers async achievement verification", async () => {
    const req = createRequest("http://localhost/api/lessons/complete", {
      method: "POST",
      body: JSON.stringify({ correct: 3, total: 3 }),
    })
    await completeLesson(req)

    let found = false
    for (let i = 0; i < 20; i++) {
      const count = await prisma.userAchievement.count({ where: { userId: TEST_USER_ID } })
      if (count > 0) { found = true; break }
      await new Promise((r) => setTimeout(r, 100))
    }
    expect(found).toBe(true)
  })

  it("returns 500 on invalid JSON body", async () => {
    const req = createRequest("http://localhost/api/lessons/complete", {
      method: "POST",
      body: "not-json",
    })
    const res = await completeLesson(req)
    expect(res.status).toBe(500)
  })
})

// =============================================
// GET /api/progress
// =============================================
describe("GET /api/progress", () => {
  it("returns 401 without auth", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const res = await getProgress()
    expect(res.status).toBe(401)
  })

  it("returns empty array for no progress", async () => {
    const res = await getProgress()
    const body = await res.json()
    expect(body.length).toBe(0)
  })

  it("returns progress entries with exercise info", async () => {
    await prisma.progress.createMany({
      data: [
        { userId: TEST_USER_ID, exerciseId: exerciseIds[0], correct: true, completed: true },
        { userId: TEST_USER_ID, exerciseId: exerciseIds[1], correct: false, completed: true },
      ],
    })

    const res = await getProgress()
    const body = await res.json()
    expect(body.length).toBe(2)
    expect(body[0].exercise.id).toBe(exerciseIds[0])
    expect(body[1].correct).toBe(false)
  })
})

// =============================================
// POST /api/progress
// =============================================
describe("POST /api/progress", () => {
  it("returns 401 without auth", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const req = createRequest("http://localhost/api/progress", {
      method: "POST",
      body: JSON.stringify({ exerciseId: exerciseIds[2], correct: true }),
    })
    const res = await saveProgress(req)
    expect(res.status).toBe(401)
  })

  it("returns 400 without exerciseId", async () => {
    const req = createRequest("http://localhost/api/progress", {
      method: "POST",
      body: JSON.stringify({ correct: true }),
    })
    const res = await saveProgress(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("exerciseId")
  })

  it("creates new progress and returns 201", async () => {
    const req = createRequest("http://localhost/api/progress", {
      method: "POST",
      body: JSON.stringify({ exerciseId: exerciseIds[2], correct: true }),
    })
    const res = await saveProgress(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.exerciseId).toBe(exerciseIds[2])
    expect(body.correct).toBe(true)
  })

  it("returns existing progress without duplicating (200)", async () => {
    await prisma.progress.create({
      data: { userId: TEST_USER_ID, exerciseId: exerciseIds[0], correct: true, completed: true },
    })
    const req = createRequest("http://localhost/api/progress", {
      method: "POST",
      body: JSON.stringify({ exerciseId: exerciseIds[0], correct: false }),
    })
    const res = await saveProgress(req)
    expect(res.status).toBe(200)

    const count = await prisma.progress.count({
      where: { userId: TEST_USER_ID, exerciseId: exerciseIds[0] },
    })
    expect(count).toBe(1)
  })
})

// =============================================
// POST /api/achievements
// =============================================
describe("POST /api/achievements", () => {
  it("returns 401 without auth", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const res = await verifyAchievements()
    expect(res.status).toBe(401)
  })

  it("unlocks achievements when thresholds are met", async () => {
    await prisma.user.update({
      where: { id: TEST_USER_ID },
      data: { xp: 150, streak: 5, lessonsCompleted: 3, perfectLessons: 1 },
    })
    const res = await verifyAchievements()
    const body = await res.json()
    expect(body.unlocked.length).toBe(4)
    const titles = body.unlocked.map((u: { title: string }) => u.title)
    expect(titles).toContain("100 XP")
    expect(titles).toContain("3 Days")
    expect(titles).toContain("First Lesson")
    expect(titles).toContain("Perfect!")
  })

  it("does not re-unlock already earned achievements", async () => {
    await prisma.user.update({
      where: { id: TEST_USER_ID },
      data: { xp: 150, streak: 5, lessonsCompleted: 3, perfectLessons: 1 },
    })
    await verifyAchievements()
    const res = await verifyAchievements()
    const body = await res.json()
    expect(body.unlocked.length).toBe(0)
  })

  it("returns title and icon in unlock details", async () => {
    await prisma.user.update({
      where: { id: TEST_USER_ID },
      data: { xp: 600, streak: 3, lessonsCompleted: 5, perfectLessons: 1 },
    })
    const res = await verifyAchievements()
    const body = await res.json()
    expect(body.unlocked[0].title).toBeDefined()
    expect(body.unlocked[0].icon).toBeDefined()
  })

  it("returns empty array when no thresholds met", async () => {
    const res = await verifyAchievements()
    const body = await res.json()
    expect(body.unlocked.length).toBe(0)
  })
})

// =============================================
// GET /api/leaderboard
// =============================================
describe("GET /api/leaderboard", () => {
  it("returns 401 without auth", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    const res = await getLeaderboard()
    expect(res.status).toBe(401)
  })

  it("returns entries sorted by XP descending", async () => {
    const res = await getLeaderboard()
    const body = await res.json()
    for (let i = 1; i < body.entries.length; i++) {
      expect(body.entries[i].xp).toBeLessThanOrEqual(body.entries[i - 1].xp)
    }
  })

  it("marks current user with isCurrentUser=true", async () => {
    const res = await getLeaderboard()
    const body = await res.json()
    const me = body.entries.find((e: { userId: string }) => e.userId === TEST_USER_ID)
    expect(me.isCurrentUser).toBe(true)
    const other = body.entries.find((e: { userId: string }) => e.userId === OTHER_USER_ID)
    expect(other.isCurrentUser).toBe(false)
  })

  it("provides currentUserRank, currentUserXp, totalParticipants", async () => {
    const res = await getLeaderboard()
    const body = await res.json()
    // Other User has 150 XP (rank 1), Test User has 50 XP (rank 2)
    expect(body.currentUserRank).toBe(2)
    expect(body.currentUserXp).toBe(50)
    expect(body.totalParticipants).toBe(2)
  })

  it("limits entries to top 50", async () => {
    for (let i = 0; i < 60; i++) {
      await prisma.user.create({
        data: { id: `bulk-${i}`, name: `Bulk ${i}`, email: `bulk${i}@test.com`, xp: i },
      })
    }
    const res = await getLeaderboard()
    const body = await res.json()
    expect(body.entries.length).toBeLessThanOrEqual(50)
    await prisma.user.deleteMany({ where: { id: { startsWith: "bulk-" } } })
  })

  it("includes weekStart and weekEnd ISO dates", async () => {
    const res = await getLeaderboard()
    const body = await res.json()
    expect(() => new Date(body.weekStart)).not.toThrow()
    expect(() => new Date(body.weekEnd)).not.toThrow()
  })
})

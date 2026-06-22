import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { verifyAchievements } from "@/lib/achievements"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const newUnlocks = await verifyAchievements(session.user.id)
    return NextResponse.json({ unlocked: newUnlocks })
  } catch {
    return NextResponse.json({ error: "Error al verificar logros" }, { status: 500 })
  }
}

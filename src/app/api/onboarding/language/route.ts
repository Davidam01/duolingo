import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { language } = await request.json()
    if (!language) {
      return NextResponse.json({ error: "language requerido" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        learningLanguage: language,
        onboardingComplete: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error al guardar idioma" }, { status: 500 })
  }
}

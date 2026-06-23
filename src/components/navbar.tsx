import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NavbarClient } from "./navbar-client"

export async function Navbar() {
  const session = await auth()

  let xp = 0
  let learningLanguage: string | null = null
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, learningLanguage: true },
    })
    xp = user?.xp ?? 0
    learningLanguage = user?.learningLanguage ?? null
  }

  return <NavbarClient session={session} xp={xp} learningLanguage={learningLanguage} />
}

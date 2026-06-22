import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NavbarClient } from "./navbar-client"

export async function Navbar() {
  const session = await auth()

  let xp = 0
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true },
    })
    xp = user?.xp ?? 0
  }

  return <NavbarClient session={session} xp={xp} />
}

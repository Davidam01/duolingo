import { auth } from "@/lib/auth"

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url)

  const publicPaths = ["/", "/login", "/register", "/api/auth", "/_next"]
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (isPublic) return undefined

  const session = await auth()
  if (!session) {
    return Response.redirect(new URL("/login", request.url))
  }

  return undefined
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico|.*\\.).*)"],
}

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña requeridos")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          const user = await prisma.user.findUnique({ where: { email } })

          if (!user?.hashedPassword) {
            throw new Error("Credenciales inválidas")
          }

          const valid = await compare(password, user.hashedPassword)
          if (!valid) {
            throw new Error("Credenciales inválidas")
          }

          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          if (error instanceof Error) throw error
          throw new Error("Error de conexión con la base de datos")
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      if (typeof token.onboardingComplete === "boolean") {
        session.user.onboardingComplete = token.onboardingComplete
      }
      return session
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
      }
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { onboardingComplete: true },
          })
          token.onboardingComplete = dbUser?.onboardingComplete ?? false
        } catch {
          token.onboardingComplete = false
        }
      }
      return token
    },
  },
})

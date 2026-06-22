import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      onboardingComplete?: boolean
    }
  }

  interface User {
    onboardingComplete?: boolean
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    onboardingComplete?: boolean
  }
}

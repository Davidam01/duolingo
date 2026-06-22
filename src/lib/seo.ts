export const siteConfig = {
  name: "Duolingo",
  description: "Aprende idiomas gratis con lecciones divertidas y gamificadas",
  url: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/Davidam01/duolingo",
  },
}

export type SiteConfig = typeof siteConfig

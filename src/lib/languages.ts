export interface Language {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: "en", name: "Inglés", flag: "🇬🇧" },
  { code: "fr", name: "Francés", flag: "🇫🇷" },
  { code: "de", name: "Alemán", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portugués", flag: "🇵🇹" },
  { code: "ja", name: "Japonés", flag: "🇯🇵" },
  { code: "ko", name: "Coreano", flag: "🇰🇷" },
  { code: "zh", name: "Chino", flag: "🇨🇳" },
  { code: "ru", name: "Ruso", flag: "🇷🇺" },
  { code: "ar", name: "Árabe", flag: "🇸🇦" },
]

export const flags: Record<string, string> = Object.fromEntries(
  languages.map((l) => [l.code, l.flag]),
)

export function getLangName(code: string): string {
  return languages.find((l) => l.code === code)?.name ?? code
}

import "@testing-library/jest-dom"
import { render, screen, fireEvent } from "@testing-library/react"
import { NavbarClient } from "../navbar-client"
import { signOut } from "next-auth/react"

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}))

// Mock next/navigation with mutable pathname
let currentPathname = "/learn"
jest.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({ refresh: jest.fn() }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  currentPathname = "/learn"
})

describe("NavbarClient - Sin sesion", () => {
  it("renderiza los botones de iniciar sesion y registrarse", () => {
    render(<NavbarClient session={null} xp={0} />)

    expect(screen.getByText("iniciar sesión")).toBeInTheDocument()
    expect(screen.getByText("registrarse")).toBeInTheDocument()
  })

  it("no muestra el XP counter ni el boton de logout", () => {
    render(<NavbarClient session={null} xp={0} />)

    expect(screen.queryByText("XP")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Cerrar sesión")).not.toBeInTheDocument()
  })

  it("muestra el logo de duolingo enlace a /", () => {
    render(<NavbarClient session={null} xp={0} />)

    const logo = screen.getByText("duolingo")
    expect(logo.closest("a")).toHaveAttribute("href", "/")
  })
})

describe("NavbarClient - Con sesion", () => {
  const session = {
    user: {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      onboardingComplete: true,
    },
  }

  it("renderiza los enlaces de navegacion", () => {
    render(<NavbarClient session={session} xp={100} />)

    // Both desktop and mobile render these - getAllByText returns both
    const homeLinks = screen.getAllByText("Inicio")
    expect(homeLinks.length).toBeGreaterThanOrEqual(1)

    const learnLinks = screen.getAllByText("Aprender")
    expect(learnLinks.length).toBeGreaterThanOrEqual(1)

    const leaderLinks = screen.getAllByText("Clasificación")
    expect(leaderLinks.length).toBeGreaterThanOrEqual(1)

    const profileLinks = screen.getAllByText("Perfil")
    expect(profileLinks.length).toBeGreaterThanOrEqual(1)
  })

  it("muestra el XP counter", () => {
    render(<NavbarClient session={session} xp={250} />)

    expect(screen.getByText("250")).toBeInTheDocument()
    expect(screen.getByText("XP")).toBeInTheDocument()
  })

  it("muestra el boton de logout con icono", () => {
    render(<NavbarClient session={session} xp={0} />)

    const logoutBtns = screen.getAllByTitle("Cerrar sesión")
    expect(logoutBtns.length).toBeGreaterThanOrEqual(1)
  })

  it("llama a signOut con callbackUrl al hacer click en logout", () => {
    render(<NavbarClient session={session} xp={0} />)

    // Click the first (desktop) logout button
    const logoutBtns = screen.getAllByTitle("Cerrar sesión")
    fireEvent.click(logoutBtns[0])

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" })
  })

  it("marca el enlace activo segun la ruta actual", () => {
    currentPathname = "/"
    render(<NavbarClient session={session} xp={0} />)

    // Get all "Inicio" links - the desktop one (first) should be bold
    const homeLinks = screen.getAllByText("Inicio")
    const activeDesktopLink = homeLinks[0] // Desktop nav renders first
    expect(activeDesktopLink.className).toContain("font-bold")
  })
})

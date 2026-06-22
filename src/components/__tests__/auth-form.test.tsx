import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { AuthForm } from "../auth-form"
import { signIn } from "next-auth/react"

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}))

// Mock next/navigation
const mockGet = jest.fn()
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe("AuthForm - Login mode", () => {
  beforeEach(() => {
    mockGet.mockReturnValue(null)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({}),
    })
  })

  it("renderiza el formulario de login con email y password", () => {
    render(<AuthForm mode="login" />)

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument()
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument()
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument()
  })

  it("no muestra el campo de nombre en modo login", () => {
    render(<AuthForm mode="login" />)

    expect(screen.queryByLabelText("Nombre")).not.toBeInTheDocument()
  })

  it("llama a signIn con credentials al hacer submit", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true, error: undefined })

    render(<AuthForm mode="login" />)

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "password123" },
    })

    await act(async () => {
      fireEvent.click(screen.getByText("Iniciar sesión"))
    })

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password123",
      redirect: false,
    })
  })

  it("no muestra error tras login exitoso", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true, error: undefined })

    render(<AuthForm mode="login" />)

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "password123" },
    })

    await act(async () => {
      fireEvent.click(screen.getByText("Iniciar sesión"))
    })

    // After successful login, no error should be visible
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("muestra error y limpia el estado de carga si signIn falla", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: "CredentialsSignin",
    })

    render(<AuthForm mode="login" />)

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "wrong" },
    })

    await act(async () => {
      fireEvent.click(screen.getByText("Iniciar sesión"))
    })

    // Should show error message
    expect(screen.getByText("Email o contraseña incorrectos")).toBeInTheDocument()
    // Should not be in loading state
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument()
    // Button should be enabled again
    expect(screen.getByRole("button")).not.toBeDisabled()
  })

  it("deshabilita el boton mientras carga", async () => {
    ;(signIn as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<AuthForm mode="login" />)

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "password123" },
    })

    fireEvent.click(screen.getByText("Iniciar sesión"))

    expect(screen.getByText("Cargando...")).toBeInTheDocument()
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("no muestra el boton de Google si no hay provider", async () => {
    render(<AuthForm mode="login" />)

    await waitFor(() => {
      expect(screen.queryByText("Google")).not.toBeInTheDocument()
    })
  })

  it("muestra el boton de Google si el provider existe", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ google: { id: "google" } }),
    })

    render(<AuthForm mode="login" />)

    await waitFor(() => {
      expect(screen.getByText("Google")).toBeInTheDocument()
    })
  })

  it("llama a signIn con google al hacer click en el boton de Google", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ google: { id: "google" } }),
    })

    render(<AuthForm mode="login" />)

    await waitFor(() => {
      expect(screen.getByText("Google")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Google"))

    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/learn" })
  })

  it("muestra error si hay un error en searchParams", () => {
    mockGet.mockReturnValue("Configuration")

    render(<AuthForm mode="login" />)

    expect(screen.getByText("Configuration")).toBeInTheDocument()
  })
})

describe("AuthForm - Register mode", () => {
  beforeEach(() => {
    mockGet.mockReturnValue(null)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({}),
    })
  })

  it("renderiza el formulario de registro con nombre, email y password", () => {
    render(<AuthForm mode="register" />)

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument()
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument()
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument()
    expect(screen.getByText("Crear cuenta")).toBeInTheDocument()
  })

  it("registra al usuario via API y luego inicia sesion", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true, error: undefined })

    render(<AuthForm mode="register" />)

    // Wait for providers check to complete, then set up register API mock
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/providers")
    })

    // Now set up the register API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "1", email: "test@example.com" }),
    })

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Test User" },
    })
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "password123" },
    })

    await act(async () => {
      fireEvent.click(screen.getByText("Crear cuenta"))
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("test@example.com"),
      }),
    )
    expect(signIn).toHaveBeenCalled()
  })

  it("muestra error si el registro falla", async () => {
    render(<AuthForm mode="register" />)

    // Wait for providers check to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/providers")
    })

    // Now set up the register API response (failure)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "El email ya está registrado" }),
    })

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Test User" },
    })
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "exists@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "password123" },
    })

    await act(async () => {
      fireEvent.click(screen.getByText("Crear cuenta"))
    })

    expect(screen.getByText("El email ya está registrado")).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })
})

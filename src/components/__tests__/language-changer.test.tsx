import "@testing-library/jest-dom"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { LanguageChanger } from "../language-changer"

const mockRefresh = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ ok: true }),
  })
})

describe("LanguageChanger", () => {
  it("muestra el boton 'cambiar idioma'", () => {
    render(<LanguageChanger currentLanguage="en" />)

    expect(screen.getByText("cambiar idioma")).toBeInTheDocument()
  })

  it("oculta la grilla de idiomas inicialmente", () => {
    render(<LanguageChanger currentLanguage="en" />)

    expect(screen.queryByText("Inglés")).not.toBeInTheDocument()
    expect(screen.queryByText("Francés")).not.toBeInTheDocument()
  })

  it("muestra la grilla de idiomas al hacer click en cambiar idioma", () => {
    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))

    expect(screen.getByText("Inglés")).toBeInTheDocument()
    expect(screen.getByText("Francés")).toBeInTheDocument()
    expect(screen.getByText("Alemán")).toBeInTheDocument()
    expect(screen.getByText("Japonés")).toBeInTheDocument()
  })

  it("deshabilita el boton del idioma actual y lo marca como seleccionado", () => {
    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))

    const englishBtn = screen.getByText("Inglés").closest("button")
    expect(englishBtn).toBeDisabled()
  })

  it("el boton del idioma actual esta deshabilitado y no llama a la API", async () => {
    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))

    // Inglés is disabled (current language), so clicking it does nothing
    const englishBtn = screen.getByText("Inglés").closest("button")!
    expect(englishBtn).toBeDisabled()

    // Click disabled button - should not trigger handleChange
    fireEvent.click(englishBtn)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("llama a la API al seleccionar un idioma diferente", async () => {
    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))

    await act(async () => {
      fireEvent.click(screen.getByText("Francés"))
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/onboarding/language",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"language":"fr"'),
      }),
    )
  })

  it("envia skipOnboarding: true en la peticion", async () => {
    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))

    await act(async () => {
      fireEvent.click(screen.getByText("Francés"))
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/onboarding/language",
      expect.objectContaining({
        body: expect.stringContaining('"skipOnboarding":true'),
      }),
    )
  })

  it("cierra el selector tras cambio exitoso", async () => {
    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))
    expect(screen.getByText("Francés")).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText("Francés"))
    })

    expect(screen.queryByText("Francés")).not.toBeInTheDocument()
  })

  it("llama a router.refresh() tras cambio exitoso", async () => {
    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))

    await act(async () => {
      fireEvent.click(screen.getByText("Francés"))
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it("muestra mensaje de error si la API falla", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))

    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))

    await act(async () => {
      fireEvent.click(screen.getByText("Francés"))
    })

    expect(screen.getByText("Error al cambiar idioma")).toBeInTheDocument()
  })

  it("no cierra el selector si la API falla", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))

    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))
    expect(screen.getByText("Francés")).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText("Francés"))
    })

    // Selector should remain open with error visible
    expect(screen.getByText("Francés")).toBeInTheDocument()
    expect(screen.getByText("Error al cambiar idioma")).toBeInTheDocument()
  })

  it("muestra 'guardando...' mientras cambia el idioma", async () => {
    // Keep promise pending
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}))

    render(<LanguageChanger currentLanguage="en" />)

    fireEvent.click(screen.getByText("cambiar idioma"))
    fireEvent.click(screen.getByText("Francés"))

    expect(screen.getByText("guardando...")).toBeInTheDocument()
  })
})

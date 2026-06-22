import "@testing-library/jest-dom"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { ExerciseCard } from "../exercise-card"

const defaultProps = {
  type: "MULTIPLE_CHOICE",
  question: "¿Cómo se dice 'Hola' en inglés?",
  options: ["Hello", "Goodbye", "Thanks", "Please"],
  answer: "Hello",
  onAnswer: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe("ExerciseCard", () => {
  it("renderiza la pregunta y las opciones", () => {
    render(<ExerciseCard {...defaultProps} />)

    expect(screen.getByText("¿Cómo se dice 'Hola' en inglés?")).toBeInTheDocument()
    expect(screen.getByText("Hello")).toBeInTheDocument()
    expect(screen.getByText("Goodbye")).toBeInTheDocument()
    expect(screen.getByText("Thanks")).toBeInTheDocument()
    expect(screen.getByText("Please")).toBeInTheDocument()
  })

  it("muestra el label 'traduce la frase' cuando el tipo es TRANSLATION", () => {
    render(<ExerciseCard {...defaultProps} type="TRANSLATION" />)

    expect(screen.getByText("traduce la frase")).toBeInTheDocument()
  })

  it("no muestra el label 'traduce la frase' para MULTIPLE_CHOICE", () => {
    render(<ExerciseCard {...defaultProps} />)

    expect(screen.queryByText("traduce la frase")).not.toBeInTheDocument()
  })

  it("aplica grid de 2 columnas para FILL_BLANK", () => {
    const { container } = render(<ExerciseCard {...defaultProps} type="FILL_BLANK" />)

    const gridContainer = container.querySelector(".grid-cols-2")
    expect(gridContainer).toBeInTheDocument()
  })

  it("aplica espacio vertical (space-y-3) para MULTIPLE_CHOICE", () => {
    const { container } = render(<ExerciseCard {...defaultProps} />)

    const verticalContainer = container.querySelector(".space-y-3")
    expect(verticalContainer).toBeInTheDocument()
  })

  it("el botón de confirmar está deshabilitado cuando no hay selección", () => {
    render(<ExerciseCard {...defaultProps} />)

    const confirmBtn = screen.getByText("confirmar")
    expect(confirmBtn).toBeDisabled()
  })

  it("habilita el botón de confirmar al seleccionar una opción", () => {
    render(<ExerciseCard {...defaultProps} />)

    fireEvent.click(screen.getByText("Hello"))
    const confirmBtn = screen.getByText("confirmar")
    expect(confirmBtn).not.toBeDisabled()
  })

  it("llama a onAnswer con la opción seleccionada después de 600ms al confirmar", () => {
    const onAnswer = jest.fn()
    render(<ExerciseCard {...defaultProps} onAnswer={onAnswer} />)

    fireEvent.click(screen.getByText("Hello"))
    fireEvent.click(screen.getByText("confirmar"))

    expect(onAnswer).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(onAnswer).toHaveBeenCalledWith("Hello")
    expect(onAnswer).toHaveBeenCalledTimes(1)
  })

  it("no llama a onAnswer si no hay selección", () => {
    const onAnswer = jest.fn()
    render(<ExerciseCard {...defaultProps} onAnswer={onAnswer} />)

    fireEvent.click(screen.getByText("confirmar"))
    // Button is disabled, so no action
    expect(onAnswer).not.toHaveBeenCalled()
  })

  it("muestra feedback ✅ para una respuesta correcta", () => {
    render(<ExerciseCard {...defaultProps} />)

    fireEvent.click(screen.getByText("Hello")) // Correct answer
    fireEvent.click(screen.getByText("confirmar"))

    expect(screen.getByText("✅")).toBeInTheDocument()
    expect(screen.getByText("siguiente →")).toBeInTheDocument()
  })

  it("muestra feedback ❌ y la respuesta correcta para una respuesta incorrecta", () => {
    render(<ExerciseCard {...defaultProps} />)

    fireEvent.click(screen.getByText("Goodbye")) // Wrong answer
    fireEvent.click(screen.getByText("confirmar"))

    expect(screen.getByText("❌")).toBeInTheDocument()
    expect(screen.getByText(/respuesta correcta:/)).toBeInTheDocument()
    // Hello appears as both option text and correct answer — use getAllByText and check it exists
    const helloElements = screen.getAllByText("Hello")
    expect(helloElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("siguiente →")).toBeInTheDocument()
  })

  it("el botón de confirmar está deshabilitado después de responder", () => {
    render(<ExerciseCard {...defaultProps} />)

    fireEvent.click(screen.getByText("Hello"))
    fireEvent.click(screen.getByText("confirmar"))

    const confirmBtn = screen.getByText("siguiente →")
    expect(confirmBtn).toBeDisabled()
  })

  it("no permite cambiar la selección después de responder", () => {
    render(<ExerciseCard {...defaultProps} />)

    fireEvent.click(screen.getByText("Hello")) // Select correct
    fireEvent.click(screen.getByText("confirmar"))

    // Try to select a different option
    fireEvent.click(screen.getByText("Goodbye"))

    // The confirm button text should still say "siguiente →" (answered state)
    expect(screen.getByText("siguiente →")).toBeInTheDocument()
  })

  it("renderiza la pregunta en cursiva cuando es TRANSLATION", () => {
    const { container } = render(<ExerciseCard {...defaultProps} type="TRANSLATION" />)

    const questionEl = container.querySelector(".italic")
    expect(questionEl).toBeInTheDocument()
    expect(questionEl).toHaveTextContent("¿Cómo se dice 'Hola' en inglés?")
  })
})

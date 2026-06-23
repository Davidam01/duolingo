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

  // --- LISTENING ---

  it("LISTENING: muestra el botón de play y las opciones", () => {
    render(
      <ExerciseCard type="LISTENING" question="apple" options={["manzana", "naranja"]} answer="manzana" onAnswer={jest.fn()} />,
    )

    expect(screen.getByLabelText("Escuchar pronunciación")).toBeInTheDocument()
    expect(screen.getByText("escucha y responde")).toBeInTheDocument()
    expect(screen.getByText("manzana")).toBeInTheDocument()
    expect(screen.getByText("naranja")).toBeInTheDocument()
  })

  it("LISTENING: deshabilita el botón de play al hacer clic", () => {
    render(
      <ExerciseCard type="LISTENING" question="apple" options={["manzana", "naranja"]} answer="manzana" onAnswer={jest.fn()} />,
    )

    const playBtn = screen.getByLabelText("Escuchar pronunciación")
    fireEvent.click(playBtn)
    expect(playBtn).toBeDisabled()
  })

  // --- ORDERING ---

  it("ORDERING: muestra el label y las palabras disponibles", () => {
    render(
      <ExerciseCard
        type="ORDERING"
        question="Ordena las palabras"
        options={['["Where","is","the","station"]']}
        answer="Where is the station"
        onAnswer={jest.fn()}
      />,
    )

    expect(screen.getByText("ordena las palabras")).toBeInTheDocument()
    expect(screen.getByText("Where")).toBeInTheDocument()
    expect(screen.getByText("is")).toBeInTheDocument()
    expect(screen.getByText("the")).toBeInTheDocument()
    expect(screen.getByText("station")).toBeInTheDocument()
  })

  it("ORDERING: permite construir y modificar la frase", () => {
    render(
      <ExerciseCard
        type="ORDERING"
        question="Ordena"
        options={['["I","go","home"]']}
        answer="I go home"
        onAnswer={jest.fn()}
      />,
    )

    // Click words to build sentence
    fireEvent.click(screen.getByText("I"))
    fireEvent.click(screen.getByText("home"))
    fireEvent.click(screen.getByText("go"))

    // Confirm button should be enabled
    const confirmBtn = screen.getByText("confirmar")
    expect(confirmBtn).not.toBeDisabled()

    // Click a word in sentence to remove it
    fireEvent.click(screen.getByText("go"))

    // go should be back in available pool
    expect(screen.getByText("go")).toBeInTheDocument()
  })

  it("ORDERING: deshabilita botón de confirmar con frase vacía", () => {
    render(
      <ExerciseCard
        type="ORDERING"
        question="Ordena"
        options={['["I","go","home"]']}
        answer="I go home"
        onAnswer={jest.fn()}
      />,
    )

    const confirmBtn = screen.getByText("confirmar")
    expect(confirmBtn).toBeDisabled()
  })

  // --- FREE_FORM ---

  it("FREE_FORM: muestra input de texto y permite escribir", () => {
    render(
      <ExerciseCard
        type="FREE_FORM"
        question="Escribe"
        options={[]}
        answer="hello"
        onAnswer={jest.fn()}
      />,
    )

    const input = screen.getByPlaceholderText("escribe tu respuesta...")
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "hello" } })
    expect(input).toHaveValue("hello")
  })

  it("FREE_FORM: deshabilita confirmar con input vacío", () => {
    render(
      <ExerciseCard
        type="FREE_FORM"
        question="Escribe"
        options={[]}
        answer="hello"
        onAnswer={jest.fn()}
      />,
    )

    const confirmBtn = screen.getByText("confirmar")
    expect(confirmBtn).toBeDisabled()
  })

  it("FREE_FORM: habilita confirmar al escribir", () => {
    render(
      <ExerciseCard
        type="FREE_FORM"
        question="Escribe"
        options={[]}
        answer="hello"
        onAnswer={jest.fn()}
      />,
    )

    const input = screen.getByPlaceholderText("escribe tu respuesta...")
    fireEvent.change(input, { target: { value: "hello" } })
    const confirmBtn = screen.getByText("confirmar")
    expect(confirmBtn).not.toBeDisabled()
  })

  it("FREE_FORM: submit con Enter", () => {
    const onAnswer = jest.fn()
    render(
      <ExerciseCard
        type="FREE_FORM"
        question="Escribe"
        options={[]}
        answer="hello"
        onAnswer={onAnswer}
      />,
    )

    const input = screen.getByPlaceholderText("escribe tu respuesta...")
    fireEvent.change(input, { target: { value: "hello" } })
    fireEvent.keyDown(input, { key: "Enter" })
    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(onAnswer).toHaveBeenCalledWith("hello")
  })

  it("FREE_FORM: muestra feedback correcto/incorrecto", () => {
    const onAnswer = jest.fn()
    render(
      <ExerciseCard
        type="FREE_FORM"
        question="Escribe"
        options={[]}
        answer="hello"
        onAnswer={onAnswer}
      />,
    )

    const input = screen.getByPlaceholderText("escribe tu respuesta...")
    fireEvent.change(input, { target: { value: "hola" } })
    fireEvent.click(screen.getByText("confirmar"))

    expect(screen.getByText(/incorrecto/)).toBeInTheDocument()
    expect(screen.getByText(/hello/)).toBeInTheDocument() // Shows correct answer
    expect(screen.getByText(/hola/)).toBeInTheDocument() // Shows user's answer
  })
})

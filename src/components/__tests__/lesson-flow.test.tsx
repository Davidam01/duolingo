import "@testing-library/jest-dom"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { LessonFlow, type ExerciseData } from "../lesson-flow"

const mockExercises: ExerciseData[] = [
  {
    id: "ex1",
    type: "MULTIPLE_CHOICE",
    question: "Pregunta 1",
    options: ["A", "B", "C"],
    answer: "A",
  },
  {
    id: "ex2",
    type: "MULTIPLE_CHOICE",
    question: "Pregunta 2",
    options: ["B", "C", "D"],
    answer: "B",
  },
  {
    id: "ex3",
    type: "MULTIPLE_CHOICE",
    question: "Pregunta 3",
    options: ["C", "D", "E"],
    answer: "C",
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
  // Mock fetch to succeed by default
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
  })
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe("LessonFlow", () => {
  it("renderiza el primer ejercicio y el contador de progreso", () => {
    render(<LessonFlow exercises={mockExercises} onComplete={jest.fn()} />)

    expect(screen.getByText("Pregunta 1")).toBeInTheDocument()
    expect(screen.getByText(/ejercicio 1 de 3/)).toBeInTheDocument()
  })

  it("muestra la barra de progreso al inicio (0%)", () => {
    const { container } = render(<LessonFlow exercises={mockExercises} onComplete={jest.fn()} />)

    // The progress bar uses bg-gradient-to-r from-primary to-primary/80 class
    const progressBar = container.querySelector("[style*='width']")
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveStyle({ width: "0%" })
  })

  it("actualiza la barra de progreso después de responder ejercicios", async () => {
    const { container } = render(<LessonFlow exercises={mockExercises} onComplete={jest.fn()} />)

    // Answer first exercise correctly
    fireEvent.click(screen.getByText("A"))
    fireEvent.click(screen.getByText("confirmar"))

    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    // Find by style attribute since class changed to gradient
    const progressBar = container.querySelector("[style*='width']")
    expect(progressBar).toHaveStyle({ width: "33.33333333333333%" })
  })

  it("avanza al siguiente ejercicio después de responder", async () => {
    const onComplete = jest.fn()
    render(<LessonFlow exercises={mockExercises} onComplete={onComplete} />)

    // Answer first exercise
    fireEvent.click(screen.getByText("A"))
    fireEvent.click(screen.getByText("confirmar"))

    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    expect(screen.getByText("Pregunta 2")).toBeInTheDocument()
    expect(screen.getByText(/ejercicio 2 de 3/)).toBeInTheDocument()
  })

  it("llama a onComplete con correct/total después del último ejercicio", async () => {
    const onComplete = jest.fn()
    render(<LessonFlow exercises={mockExercises} onComplete={onComplete} />)

    // Answer all 3 exercises correctly
    for (const answer of ["A", "B", "C"]) {
      fireEvent.click(screen.getByText(answer))
      fireEvent.click(screen.getByText("confirmar"))

      await act(async () => {
        jest.advanceTimersByTime(600)
      })
    }

    expect(onComplete).toHaveBeenCalledWith(3, 3)
  })

  it("llama a onComplete con el número correcto de aciertos (parcial)", async () => {
    const onComplete = jest.fn()
    render(<LessonFlow exercises={mockExercises} onComplete={onComplete} />)

    // ex1: correct (A)
    fireEvent.click(screen.getByText("A"))
    fireEvent.click(screen.getByText("confirmar"))
    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    // ex2: incorrect (pick C instead of B)
    fireEvent.click(screen.getByText("C"))
    fireEvent.click(screen.getByText("confirmar"))
    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    // ex3: correct (C)
    fireEvent.click(screen.getByText("C"))
    fireEvent.click(screen.getByText("confirmar"))
    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    expect(onComplete).toHaveBeenCalledWith(2, 3) // 2 of 3 correct
  })

  it("muestra la pantalla de completado al terminar todos los ejercicios", async () => {
    render(<LessonFlow exercises={mockExercises} onComplete={jest.fn()} />)

    // Answer all exercises
    for (const answer of ["A", "B", "C"]) {
      fireEvent.click(screen.getByText(answer))
      fireEvent.click(screen.getByText("confirmar"))

      await act(async () => {
        jest.advanceTimersByTime(600)
      })
    }

    expect(screen.getByText("¡Lección completada!")).toBeInTheDocument()
    expect(screen.getByText("3 de 3 correctas")).toBeInTheDocument()
    expect(screen.getByText("+100 XP")).toBeInTheDocument()
  })

  it("muestra 'Sigue practicando' si el porcentaje es menor al 80%", async () => {
    // Exercise 3 has C as correct, D is wrong
    const partialExercises: ExerciseData[] = [
      { id: "ex1", type: "MULTIPLE_CHOICE", question: "Q1", options: ["A", "B", "C"], answer: "A" },
      { id: "ex2", type: "MULTIPLE_CHOICE", question: "Q2", options: ["A", "B", "C"], answer: "A" },
      { id: "ex3", type: "MULTIPLE_CHOICE", question: "Q3", options: ["A", "B", "C"], answer: "A" },
      { id: "ex4", type: "MULTIPLE_CHOICE", question: "Q4", options: ["A", "B", "C"], answer: "A" },
      { id: "ex5", type: "MULTIPLE_CHOICE", question: "Q5", options: ["A", "B", "C"], answer: "A" },
    ]
    render(<LessonFlow exercises={partialExercises} onComplete={jest.fn()} />)

    // Answer all 5 - only 3 correct (60% < 80%)
    for (let i = 0; i < 5; i++) {
      // First 3 correct, last 2 wrong
      if (i < 3) {
        fireEvent.click(screen.getByText("A"))
      } else {
        fireEvent.click(screen.getByText("B"))
      }
      fireEvent.click(screen.getByText("confirmar"))

      await act(async () => {
        jest.advanceTimersByTime(600)
      })
    }

    expect(screen.getByText("Sigue practicando")).toBeInTheDocument()
  })

  it("muestra mensaje de error cuando fetch falla (en medio de la lección)", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))

    // Use 2 exercises so after answering first, we stay in lesson (not completion screen)
    render(<LessonFlow exercises={mockExercises.slice(0, 2)} onComplete={jest.fn()} />)

    fireEvent.click(screen.getByText("A"))
    fireEvent.click(screen.getByText("confirmar"))

    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    // Now on exercise 2 — error message should be visible
    expect(
      screen.getByText("Error al guardar progreso, pero tu respuesta se registró"),
    ).toBeInTheDocument()
  })

  it("llama a fetch por cada ejercicio respondido", async () => {
    render(<LessonFlow exercises={mockExercises} onComplete={jest.fn()} />)

    for (const answer of ["A", "B", "C"]) {
      fireEvent.click(screen.getByText(answer))
      fireEvent.click(screen.getByText("confirmar"))

      await act(async () => {
        jest.advanceTimersByTime(600)
      })
    }

    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it("envía correct=false a fetch cuando la respuesta es incorrecta", async () => {
    render(<LessonFlow exercises={mockExercises.slice(0, 1)} onComplete={jest.fn()} />)

    fireEvent.click(screen.getByText("B")) // Wrong answer
    fireEvent.click(screen.getByText("confirmar"))

    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/progress",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"correct":false'),
      }),
    )
  })

  it("envía correct=true a fetch cuando la respuesta es correcta", async () => {
    render(<LessonFlow exercises={mockExercises.slice(0, 1)} onComplete={jest.fn()} />)

    fireEvent.click(screen.getByText("A")) // Correct answer
    fireEvent.click(screen.getByText("confirmar"))

    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/progress",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"correct":true'),
      }),
    )
  })
})

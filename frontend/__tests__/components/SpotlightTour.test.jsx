import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { TourProvider, useTour } from "@/lib/tourContext"
import SpotlightTooltip from "@/components/onboarding/SpotlightTooltip"

// Test harness controller
function TestTourController() {
  const { isTourActive, currentStep, startTour, nextStep, prevStep, endTour } = useTour()
  return (
    <div>
      <div data-testid="tour-active">{String(isTourActive)}</div>
      <div data-testid="tour-step">{String(currentStep)}</div>
      <button data-testid="btn-start-tour" onClick={startTour}>
        Action Start
      </button>
      <button data-testid="btn-advance-step" onClick={nextStep}>
        Action Advance
      </button>
      <button data-testid="btn-retreat-step" onClick={prevStep}>
        Action Retreat
      </button>
      <button data-testid="btn-terminate-tour" onClick={endTour}>
        Action Terminate
      </button>
    </div>
  )
}

describe("Spotlight Tour System (TourContext & SpotlightTooltip)", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test("does not render tooltip when tour is not active", () => {
    render(
      <TourProvider>
        <TestTourController />
        <SpotlightTooltip />
      </TourProvider>
    )

    expect(screen.getByTestId("tour-active")).toHaveTextContent("false")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  test("activates tour and renders Step 1 (Starter Prompts)", async () => {
    render(
      <TourProvider>
        <TestTourController />
        <SpotlightTooltip />
      </TourProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-start-tour"))
    })

    expect(screen.getByTestId("tour-active")).toHaveTextContent("true")
    expect(screen.getByTestId("tour-step")).toHaveTextContent("1")
    expect(screen.getByText(/Start Here: Starter Prompts/i)).toBeInTheDocument()
    expect(screen.getByText(/Action-Oriented/i)).toBeInTheDocument()
    expect(screen.getByText(/1 of 3/i)).toBeInTheDocument()
  })

  test("advances through Step 1, Step 2, and Step 3 smoothly", async () => {
    render(
      <TourProvider>
        <TestTourController />
        <SpotlightTooltip />
      </TourProvider>
    )

    // Start Tour
    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-start-tour"))
    })

    // Advance to Step 2 (Live Schema)
    const nextBtn = screen.getByRole("button", { name: /^Next$/i })
    await act(async () => {
      fireEvent.click(nextBtn)
    })

    expect(screen.getByTestId("tour-step")).toHaveTextContent("2")
    expect(screen.getByText(/Zero Hallucinations: Live Schema/i)).toBeInTheDocument()
    expect(screen.getByText(/Trust & Safety/i)).toBeInTheDocument()
    expect(screen.getByText(/2 of 3/i)).toBeInTheDocument()

    // Advance to Step 3 (Connect Database)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Next$/i }))
    })

    expect(screen.getByTestId("tour-step")).toHaveTextContent("3")
    expect(screen.getByText(/Your Turn: Connect Any Database/i)).toBeInTheDocument()
    expect(screen.getByText(/The Transition/i)).toBeInTheDocument()
    expect(screen.getByText(/3 of 3/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Finish Tour/i })).toBeInTheDocument()

    // Finish Tour
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Finish Tour/i }))
    })

    expect(screen.getByTestId("tour-active")).toHaveTextContent("false")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(localStorage.getItem("has_completed_tour")).toBe("true")
  })

  test("allows moving backwards using the Back button", async () => {
    render(
      <TourProvider>
        <TestTourController />
        <SpotlightTooltip />
      </TourProvider>
    )

    // Start Tour -> Go to Step 2
    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-start-tour"))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Next$/i }))
    })
    expect(screen.getByTestId("tour-step")).toHaveTextContent("2")

    // Click Back
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Back$/i }))
    })

    expect(screen.getByTestId("tour-step")).toHaveTextContent("1")
    expect(screen.getByText(/Start Here: Starter Prompts/i)).toBeInTheDocument()
  })

  test("allows skipping the tour at any step", async () => {
    render(
      <TourProvider>
        <TestTourController />
        <SpotlightTooltip />
      </TourProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-start-tour"))
    })

    const skipBtn = screen.getByTitle(/Skip Tour/i)
    await act(async () => {
      fireEvent.click(skipBtn)
    })

    expect(screen.getByTestId("tour-active")).toHaveTextContent("false")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(localStorage.getItem("has_completed_tour")).toBe("true")
  })
})

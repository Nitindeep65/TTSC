import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import OnboardingModal from "@/components/onboarding/OnboardingModal"

describe("OnboardingModal Component", () => {
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("does not render when isOpen is false", () => {
    render(<OnboardingModal isOpen={false} onComplete={mockOnComplete} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  test("renders Step 1 (Personalization) with 3 selectable role cards", () => {
    render(<OnboardingModal isOpen={true} onComplete={mockOnComplete} />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText(/Personalize Your Workspace/i)).toBeInTheDocument()
    expect(screen.getByText(/Data Engineer \/ DBA/i)).toBeInTheDocument()
    expect(screen.getByText(/Product \/ Analyst/i)).toBeInTheDocument()
    expect(screen.getByText(/Founder \/ Exec/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument()
  })

  test("allows selecting a role card and progressing through Steps 1, 2, and 3", async () => {
    render(<OnboardingModal isOpen={true} onComplete={mockOnComplete} />)

    // Select Data Engineer
    const deCard = screen.getByText(/Data Engineer \/ DBA/i)
    await act(async () => {
      fireEvent.click(deCard)
    })

    // Advance to Step 2
    const continueBtn = screen.getByRole("button", { name: /Continue/i })
    await act(async () => {
      fireEvent.click(continueBtn)
    })

    // Step 2: The Sandbox
    expect(screen.getByText(/Explore Without Fear/i)).toBeInTheDocument()
    expect(screen.getByText(/5 Mock Schemas/i)).toBeInTheDocument()
    expect(screen.getByText(/Strict Read-Only Guard/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument()

    // Advance to Step 3
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }))
    })

    // Step 3: Copilot Setup
    expect(screen.getByText(/Query from Anywhere/i)).toBeInTheDocument()
    expect(screen.getByText(/Global In-Situ Hotkey/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument()

    // Finish & Enter Sandbox
    const finishBtn = screen.getByRole("button", { name: /Finish & Enter Sandbox/i })
    await act(async () => {
      fireEvent.click(finishBtn)
    })

    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    expect(mockOnComplete).toHaveBeenCalledWith({ role: "data_engineer" })
  })

  test("allows navigating backwards using the Back button", async () => {
    render(<OnboardingModal isOpen={true} onComplete={mockOnComplete} />)

    // Go to Step 2
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }))
    })
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument()

    // Click Back
    const backBtn = screen.getByRole("button", { name: /Back/i })
    await act(async () => {
      fireEvent.click(backBtn)
    })

    // Back on Step 1
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Personalize Your Workspace/i)).toBeInTheDocument()
  })

  test("allows skipping onboarding via Skip button", async () => {
    render(<OnboardingModal isOpen={true} onComplete={mockOnComplete} />)

    const skipBtn = screen.getByText(/Skip for now/i)
    await act(async () => {
      fireEvent.click(skipBtn)
    })

    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    expect(mockOnComplete).toHaveBeenCalledWith({ role: "analyst" })
  })
})

import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { ExtensionProvider, useExtension } from "@/lib/extensionContext"
import ExtensionPromptModal from "@/components/extension/ExtensionPromptModal"

// Test harness component to manually trigger modal
function TestModalController() {
  const { openModal, isInstalled, isModalOpen } = useExtension()

  return (
    <div>
      <div data-testid="install-status">{String(isInstalled)}</div>
      <div data-testid="modal-status">{String(isModalOpen)}</div>
      <button data-testid="btn-open-modal" onClick={() => openModal(false)}>
        Open Modal
      </button>
    </div>
  )
}

describe("ExtensionPromptModal & ExtensionContext", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    document.documentElement.removeAttribute("data-querycraft-extension-installed")
  })

  test("renders modal when opened and displays feature cards and shortcuts", async () => {
    render(
      <ExtensionProvider>
        <TestModalController />
        <ExtensionPromptModal />
      </ExtensionProvider>
    )

    const openBtn = screen.getByTestId("btn-open-modal")
    await act(async () => {
      fireEvent.click(openBtn)
    })

    expect(screen.getByText(/Unlock the QueryCraft Chrome Extension/i)).toBeInTheDocument()
    expect(screen.getByText(/Spotlight Anywhere/i)).toBeInTheDocument()
    expect(screen.getByText(/1-Click Editor Insertion/i)).toBeInTheDocument()
    expect(screen.getByText(/In-Situ SQL Doctor/i)).toBeInTheDocument()
  })

  test("switches between Interactive Spotlight Demo and 3-Step Quick Install tabs", async () => {
    render(
      <ExtensionProvider>
        <TestModalController />
        <ExtensionPromptModal />
      </ExtensionProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-open-modal"))
    })

    // Click Setup Tab
    const setupTabBtn = screen.getByRole("button", { name: /3-Step Quick Install/i })
    await act(async () => {
      fireEvent.click(setupTabBtn)
    })

    expect(screen.getByText(/Open Browser Extensions Page/i)).toBeInTheDocument()
    expect(screen.getByText(/Enable Developer Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/TTS\/extension/i)).toBeInTheDocument()

    // Click Demo Tab
    const demoTabBtn = screen.getByRole("button", { name: /Interactive Spotlight Demo/i })
    await act(async () => {
      fireEvent.click(demoTabBtn)
    })

    expect(screen.getByText(/High Value Customers/i)).toBeInTheDocument()
  })

  test("dismisses modal when clicking 'Remind me tomorrow'", async () => {
    render(
      <ExtensionProvider>
        <TestModalController />
        <ExtensionPromptModal />
      </ExtensionProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-open-modal"))
    })

    expect(screen.getByRole("dialog")).toBeInTheDocument()

    const remindBtn = screen.getByRole("button", { name: /Remind me tomorrow/i })
    await act(async () => {
      fireEvent.click(remindBtn)
    })

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(localStorage.getItem("querycraft_ext_prompt_dismissed_until")).toBeTruthy()
  })
})

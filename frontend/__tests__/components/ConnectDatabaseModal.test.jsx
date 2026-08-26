import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import ConnectDatabaseModal from "@/components/database/ConnectDatabaseModal"
import { useDatabase } from "@/lib/databaseContext"

jest.mock("@/lib/databaseContext", () => ({
  useDatabase: jest.fn(),
}))

describe("ConnectDatabaseModal Component", () => {
  const mockConnectToDatabase = jest.fn().mockResolvedValue(true)
  const mockDisconnectDatabase = jest.fn()
  const mockSetIsModalOpen = jest.fn()

  const defaultMockContext = {
    connectionUri: "",
    dbInfo: null,
    isConnecting: false,
    connectionError: "",
    connectToDatabase: mockConnectToDatabase,
    disconnectDatabase: mockDisconnectDatabase,
    isModalOpen: true,
    setIsModalOpen: mockSetIsModalOpen,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useDatabase.mockReturnValue(defaultMockContext)
  })

  test("does not render when isModalOpen is false", () => {
    useDatabase.mockReturnValue({ ...defaultMockContext, isModalOpen: false })
    const { container } = render(<ConnectDatabaseModal />)
    expect(container.firstChild).toBeNull()
  })

  test("renders modal header, tab switchers, and default provider templates", () => {
    render(<ConnectDatabaseModal />)

    expect(screen.getByText(/Connect Database & Ground Catalog/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Connection URI/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Parameter Builder/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /1-Click Sandboxes/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Security & Pre-Flight/i })).toBeInTheDocument()

    // Provider buttons
    expect(screen.getByRole("button", { name: /Supabase/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Neon/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /MongoDB Atlas/i })).toBeInTheDocument()
  })

  test("switches between provider templates and updates placeholder/helper", async () => {
    render(<ConnectDatabaseModal />)

    const neonBtn = screen.getByRole("button", { name: /Neon/i })
    await act(async () => {
      fireEvent.click(neonBtn)
    })

    expect(screen.getByText(/Neon Connection URI/i)).toBeInTheDocument()
    expect(screen.getByText(/Neon Console/i)).toBeInTheDocument()
  })

  test("switches to Parameter Builder tab and allows filling host and database", async () => {
    render(<ConnectDatabaseModal />)

    const paramsTab = screen.getByRole("button", { name: /Parameter Builder/i })
    await act(async () => {
      fireEvent.click(paramsTab)
    })

    expect(screen.getByText(/Host \/ Endpoint/i)).toBeInTheDocument()
    expect(screen.getByText(/Port/i)).toBeInTheDocument()
    expect(screen.getByText(/Database Name/i)).toBeInTheDocument()
    expect(screen.getByText(/Live Compiled URI Preview/i)).toBeInTheDocument()
  })

  test("switches to 1-Click Sandboxes tab and presents instant demo stores", async () => {
    render(<ConnectDatabaseModal />)

    const sandboxTab = screen.getByRole("button", { name: /1-Click Sandboxes/i })
    await act(async () => {
      fireEvent.click(sandboxTab)
    })

    expect(screen.getByText(/E-Commerce & Retail Store/i)).toBeInTheDocument()
    expect(screen.getByText(/SaaS Subscriptions & Billing/i)).toBeInTheDocument()
    expect(screen.getByText(/MongoDB Atlas IoT & Events/i)).toBeInTheDocument()

    const launchBtns = screen.getAllByRole("button", { name: /Launch Sandbox/i })
    expect(launchBtns.length).toBe(3)

    await act(async () => {
      fireEvent.click(launchBtns[0])
    })

    expect(mockConnectToDatabase).toHaveBeenCalledTimes(1)
    expect(mockConnectToDatabase).toHaveBeenCalledWith(expect.stringContaining("ecommerce_prod"))
  })

  test("switches to Security & Pre-Flight diagnostics tab", async () => {
    render(<ConnectDatabaseModal />)

    const diagTab = screen.getByRole("button", { name: /Security & Pre-Flight/i })
    await act(async () => {
      fireEvent.click(diagTab)
    })

    expect(screen.getByText(/Read-Only Transaction Lock/i)).toBeInTheDocument()
    expect(screen.getByText(/8,000ms Statement Timeout/i)).toBeInTheDocument()
    expect(screen.getByText(/Zero Data Persistence/i)).toBeInTheDocument()
    expect(screen.getByText(/Information Schema Grounding/i)).toBeInTheDocument()
  })

  test("displays live connected status banner when dbInfo is provided", () => {
    useDatabase.mockReturnValue({
      ...defaultMockContext,
      dbInfo: {
        database: "production_sales",
        tables_count: 8,
        host: "aws-rds.internal",
      },
    })

    render(<ConnectDatabaseModal />)

    expect(screen.getByText(/Live Introspected: production_sales/i)).toBeInTheDocument()
    expect(screen.getByText(/8 tables grounded/i)).toBeInTheDocument()
  })
})

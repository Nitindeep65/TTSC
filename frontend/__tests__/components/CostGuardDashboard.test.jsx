import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import CostGuardDashboard from "@/components/guard/CostGuardDashboard"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function renderWithClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe("CostGuardDashboard Component", () => {
  test("renders Pre-Flight Cost Guard header and preset query options", () => {
    renderWithClient(<CostGuardDashboard />)

    expect(screen.getByText(/Pre-Flight Cost Guard/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Firewall/i)).toBeInTheDocument()
    expect(screen.getByText(/Unindexed Full Seq Scan/i)).toBeInTheDocument()
    expect(screen.getByText(/Unbounded Cartesian Join/i)).toBeInTheDocument()
  })

  test("allows switching preset queries into raw SQL editor", () => {
    renderWithClient(<CostGuardDashboard />)

    const cartesianBtn = screen.getByText(/Unbounded Cartesian Join/i)
    fireEvent.click(cartesianBtn)

    const textarea = screen.getByPlaceholderText(/Paste raw SQL/i)
    expect(textarea.value).toContain("SELECT u.name, o.id")
  })

  test("displays empty state before dry-run execution", () => {
    renderWithClient(<CostGuardDashboard />)

    expect(screen.getByText(/Enter your SQL query on the left and run Pre-Flight Guard/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Pre-Flight Guard/i })).toBeInTheDocument()
  })
})

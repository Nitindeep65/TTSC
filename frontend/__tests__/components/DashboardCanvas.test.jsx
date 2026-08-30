import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import DashboardCanvas from "@/components/canvas/DashboardCanvas"

const mockCanvasData = {
  status: "complete",
  dashboard_title: "SaaS Executive Overview",
  executive_summary: "Key SaaS metrics synthesized: Net MRR $78.9K, Churn 2.1%.",
  theme: "executive",
  execution_time_total_ms: 320,
  widgets: [
    {
      id: "net_mrr",
      title: "Net MRR Velocity",
      prompt: "Show monthly MRR",
      sql_query: "SELECT month, gross_revenue FROM orders LIMIT 50;",
      explanation: "Monthly revenue trajectory.",
      recommended_chart: "line",
      grid_span: 2,
      columns: ["month", "gross_revenue"],
      rows: [
        { month: "Sep 2024", gross_revenue: 67000 },
        { month: "Oct 2024", gross_revenue: 78900 },
      ],
      row_count: 2,
      kpi_value: "$78.9K",
      kpi_delta: "+17.5% MoM",
      execution_time_ms: 18,
    },
    {
      id: "order_status",
      title: "Order Status Breakdown",
      prompt: "Breakdown by status",
      sql_query: "SELECT status, orders_count FROM orders GROUP BY status LIMIT 50;",
      explanation: "Fulfillment status breakdown.",
      recommended_chart: "pie",
      grid_span: 1,
      columns: ["status", "orders_count"],
      rows: [
        { status: "completed", orders_count: 1420 },
        { status: "processing", orders_count: 180 },
      ],
      row_count: 2,
      kpi_value: "81.0%",
      kpi_delta: "Completion Rate",
      execution_time_ms: 22,
    },
  ],
}

describe("DashboardCanvas Component", () => {
  it("renders empty state when canvasData is null", () => {
    render(<DashboardCanvas canvasData={null} />)
    expect(screen.getByText(/No Dashboard Canvas Generated Yet/i)).toBeInTheDocument()
  })

  it("renders dashboard title, theme, and executive summary", () => {
    render(<DashboardCanvas canvasData={mockCanvasData} />)
    expect(screen.getByText("SaaS Executive Overview")).toBeInTheDocument()
    expect(screen.getAllByText(/executive/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Key SaaS metrics synthesized/i)).toBeInTheDocument()
  })

  it("renders hero KPI cards with values and deltas", () => {
    render(<DashboardCanvas canvasData={mockCanvasData} />)
    expect(screen.getAllByText("$78.9K").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("+17.5% MoM")).toBeInTheDocument()
    expect(screen.getAllByText("81.0%").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Completion Rate")).toBeInTheDocument()
  })

  it("renders widget titles and toggles SQL viewer", () => {
    render(<DashboardCanvas canvasData={mockCanvasData} />)
    expect(screen.getAllByText("Net MRR Velocity").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Order Status Breakdown").length).toBeGreaterThanOrEqual(1)

    // Find code toggle buttons
    const codeButtons = screen.getAllByTitle("View SQL query")
    expect(codeButtons.length).toBeGreaterThan(0)

    // Click first toggle
    fireEvent.click(codeButtons[0])
    expect(screen.getByText(/SELECT month, gross_revenue FROM orders LIMIT 50;/i)).toBeInTheDocument()
  })

  it("switches widget chart type to table view", () => {
    render(<DashboardCanvas canvasData={mockCanvasData} />)
    const tableButtons = screen.getAllByTitle("Data Table")
    expect(tableButtons.length).toBeGreaterThan(0)

    fireEvent.click(tableButtons[0])
    // The table header for month should be visible
    expect(screen.getByText("Sep 2024")).toBeInTheDocument()
    expect(screen.getByText("Oct 2024")).toBeInTheDocument()
  })
})

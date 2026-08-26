import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DataVisualizer from '@/components/visualization/DataVisualizer'

describe('DataVisualizer Component', () => {
  const sampleColumns = ['date', 'revenue']
  const sampleRows = [
    { date: '2024-01-01', revenue: 100 },
    { date: '2024-01-02', revenue: 250 },
    { date: '2024-01-03', revenue: 400 },
  ]

  test('renders empty message when rows array is empty', () => {
    render(<DataVisualizer columns={[]} rows={[]} />)
    expect(screen.getByText(/0 rows \(Empty Table\)/i)).toBeInTheDocument()
  })

  test('renders column headers even when table contains 0 rows', () => {
    render(<DataVisualizer columns={['id', 'title', 'created_at']} rows={[]} />)
    expect(screen.getByText(/0 rows \(Empty Table\)/i)).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('created_at')).toBeInTheDocument()
  })

  test('renders tabular data by default when visual intent does not specify chart', () => {
    render(
      <DataVisualizer
        columns={sampleColumns}
        rows={sampleRows}
        visualIntent={{ should_visualize: false, recommended_chart: 'table' }}
      />
    )

    // Should display row count badge
    expect(screen.getByText(/3 rows/i)).toBeInTheDocument()

    // Should render table headers
    expect(screen.getByText('date')).toBeInTheDocument()
    expect(screen.getByText('revenue')).toBeInTheDocument()

    // Should render data rows
    expect(screen.getByText('2024-01-01')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()
  })

  test('automatically switches to chart mode when visual intent specifies line chart', () => {
    render(
      <DataVisualizer
        columns={sampleColumns}
        rows={sampleRows}
        visualIntent={{
          should_visualize: true,
          recommended_chart: 'line',
          x_key: 'date',
          y_key: 'revenue',
        }}
      />
    )

    // Chart badge should be present
    expect(screen.getByText(/Chart detected/i)).toBeInTheDocument()

    // SVG elements should be in the DOM
    const svgElement = document.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })

  test('switches between Table and Chart views when toggle buttons are clicked', () => {
    render(
      <DataVisualizer
        columns={sampleColumns}
        rows={sampleRows}
        visualIntent={{ should_visualize: false, recommended_chart: 'table' }}
      />
    )

    // Initially in Table mode
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Click Chart button
    const chartButton = screen.getByRole('button', { name: /Chart/i })
    fireEvent.click(chartButton)

    // Table should now be hidden and SVG chart visible
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(document.querySelector('svg')).toBeInTheDocument()

    // Click Table button
    const tableButton = screen.getByRole('button', { name: /Table/i })
    fireEvent.click(tableButton)

    // Table should be visible again
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  test('copies CSV data to clipboard when Copy CSV button is clicked', async () => {
    render(
      <DataVisualizer
        columns={sampleColumns}
        rows={sampleRows}
      />
    )

    const copyButton = screen.getByRole('button', { name: /CSV/i })
    fireEvent.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('date,revenue')
    )
  })

  test('renders executive KPI summary tiles in chart mode', () => {
    render(
      <DataVisualizer
        columns={sampleColumns}
        rows={sampleRows}
        visualIntent={{ should_visualize: true, recommended_chart: 'bar' }}
      />
    )

    expect(screen.getByText(/Total Sum/i)).toBeInTheDocument()
    expect(screen.getByText(/Average Value/i)).toBeInTheDocument()
    expect(screen.getByText(/Peak Record/i)).toBeInTheDocument()
    expect(screen.getByText(/Dimensions/i)).toBeInTheDocument()
    // Total sum = 100 + 250 + 400 = 750
    expect(screen.getByText('750')).toBeInTheDocument()
  })

  test('renders circular SVG donut chart when pie/donut chart type is selected', () => {
    render(
      <DataVisualizer
        columns={sampleColumns}
        rows={sampleRows}
        visualIntent={{ should_visualize: true, recommended_chart: 'pie' }}
      />
    )

    // Should render Donut center Total label
    expect(screen.getByText('Total')).toBeInTheDocument()
    // Should render legend items with percentage badges
    expect(screen.getByText('2024-01-03')).toBeInTheDocument()
    expect(screen.getByText('53%')).toBeInTheDocument()
  })
})


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
    expect(screen.getByText(/No rows returned/i)).toBeInTheDocument()
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
})

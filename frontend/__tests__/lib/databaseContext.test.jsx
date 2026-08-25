import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DatabaseProvider, useDatabase } from '@/lib/databaseContext'

function TestWorkspaceConsumer() {
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    createWorkspace,
    deleteWorkspace,
    connectionUri,
  } = useDatabase()

  return (
    <div>
      <div data-testid="active-ws-id">{activeWorkspaceId}</div>
      <div data-testid="active-ws-name">{activeWorkspace.name}</div>
      <div data-testid="active-ws-uri">{connectionUri || 'EMPTY'}</div>
      <div data-testid="ws-count">{workspaces.length}</div>

      <button
        type="button"
        data-testid="btn-create-staging"
        onClick={() =>
          createWorkspace({
            name: 'Staging DB',
            environment: 'Staging',
            connectionUri: 'postgresql://staging_user:pass@staging.neon.tech/stg',
          })
        }
      >
        Create Staging
      </button>

      <button
        type="button"
        data-testid="btn-switch-ws"
        onClick={() => {
          if (workspaces.length > 1) {
            setActiveWorkspaceId(workspaces[1].id)
          }
        }}
      >
        Switch Workspace
      </button>

      <button
        type="button"
        data-testid="btn-delete-active"
        onClick={() => deleteWorkspace(activeWorkspaceId)}
      >
        Delete Active
      </button>
    </div>
  )
}

describe('DatabaseContext & Workspace State Management', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test('initializes with default workspace and empty URI', () => {
    render(
      <DatabaseProvider>
        <TestWorkspaceConsumer />
      </DatabaseProvider>
    )

    expect(screen.getByTestId('active-ws-id')).toHaveTextContent('ws-default')
    expect(screen.getByTestId('active-ws-name')).toHaveTextContent('E-Commerce Main')
    expect(screen.getByTestId('active-ws-uri')).toHaveTextContent('EMPTY')
    expect(screen.getByTestId('ws-count')).toHaveTextContent('1')
  })

  test('creates new workspace and persists to localStorage', async () => {
    render(
      <DatabaseProvider>
        <TestWorkspaceConsumer />
      </DatabaseProvider>
    )

    const createBtn = screen.getByTestId('btn-create-staging')
    await act(async () => {
      fireEvent.click(createBtn)
    })

    // Workspaces count should now be 2
    expect(screen.getByTestId('ws-count')).toHaveTextContent('2')

    // LocalStorage should have saved workspaces
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tts_cloud_workspaces_v2',
      expect.stringContaining('Staging DB')
    )
  })

  test('switching workspace updates active workspace connection URI', async () => {
    render(
      <DatabaseProvider>
        <TestWorkspaceConsumer />
      </DatabaseProvider>
    )

    // 1. Create Staging workspace
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-create-staging'))
    })

    // 2. Switch to second workspace
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-switch-ws'))
    })

    // Should reflect new workspace details
    expect(screen.getByTestId('active-ws-name')).toHaveTextContent('Staging DB')
    expect(screen.getByTestId('active-ws-uri')).toHaveTextContent('postgresql://staging_user:pass@staging.neon.tech/stg')
  })
})

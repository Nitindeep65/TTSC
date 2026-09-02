import {
  API_BASE_URL,
  clarificationApi,
  databaseApi,
  workspaceApi,
  memoryApi,
  settingsApi,
  apiClient,
} from '@/lib/api'

describe('Centralized Frontend API Client (lib/api.js) — MVP API Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('resolves API_BASE_URL with fallback', () => {
    expect(API_BASE_URL).toBeDefined()
    expect(typeof API_BASE_URL).toBe('string')
  })

  test('clarificationApi.compileQuery calls /api/clarification with payload', async () => {
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'complete', message: 'SQL compiled', extracted_data: { sql_query: 'SELECT 1;' } },
    })

    const result = await clarificationApi.compileQuery({
      user_prompt: 'Show top 5 users',
      session_history: [],
      live_schema: 'CREATE TABLE users (id int);',
      connection_uri: 'postgresql://test:pass@localhost:5432/db',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/clarification', {
      user_prompt: 'Show top 5 users',
      session_history: [],
      live_schema: 'CREATE TABLE users (id int);',
      connection_uri: 'postgresql://test:pass@localhost:5432/db',
    })
    expect(result.status).toBe('complete')
  })

  test('databaseApi.connect calls /api/database/connect with trimmed uri', async () => {
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { engine: 'postgresql', tables: ['users', 'orders'] },
    })

    const result = await databaseApi.connect('  postgresql://usr:pwd@host/db  ')
    expect(mockPost).toHaveBeenCalledWith('/api/database/connect', {
      connection_uri: 'postgresql://usr:pwd@host/db',
    })
    expect(result.tables).toContain('users')
  })

  test('databaseApi.execute calls /api/database/execute with parameters', async () => {
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { columns: ['id', 'name'], rows: [[1, 'Alice']], row_count: 1 },
    })

    const result = await databaseApi.execute({
      connection_uri: 'postgresql://usr:pwd@host/db',
      sql_query: 'SELECT * FROM users LIMIT 10;',
      limit: 10,
    })

    expect(mockPost).toHaveBeenCalledWith('/api/database/execute', {
      connection_uri: 'postgresql://usr:pwd@host/db',
      sql_query: 'SELECT * FROM users LIMIT 10;',
      limit: 10,
      auto_heal: true,
      user_prompt: null,
      live_schema: null,
    })
    expect(result.row_count).toBe(1)
  })

  test('databaseApi.explain calls /api/database/explain with payload', async () => {
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        status: 'success',
        total_cost: 24.5,
        risk_level: 'LOW',
        performance_rating: 'fast',
        has_seq_scan: false,
      },
    })

    const result = await databaseApi.explain({
      connection_uri: 'postgresql://usr:pwd@host/db',
      sql_query: 'SELECT * FROM users WHERE id = 1;',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/database/explain', {
      connection_uri: 'postgresql://usr:pwd@host/db',
      sql_query: 'SELECT * FROM users WHERE id = 1;',
    })
    expect(result.risk_level).toBe('LOW')
  })

  test('databaseApi.diagnose calls /api/database/diagnose with payload', async () => {
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        status: 'success',
        error_code: '42703',
        error_category: 'undefined_column',
        root_cause: 'Column does not exist',
        healed_sql: 'SELECT email FROM users;',
      },
    })

    const result = await databaseApi.diagnose({
      error_message: 'column users.full_name does not exist',
      failing_sql: 'SELECT full_name FROM users;',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/database/diagnose', {
      error_message: 'column users.full_name does not exist',
      failing_sql: 'SELECT full_name FROM users;',
      live_schema: null,
      user_prompt: null,
    })
    expect(result.error_category).toBe('undefined_column')
  })

  test('workspaceApi.list and sync call workspace endpoints', async () => {
    const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [{ id: 'ws-1', name: 'Production' }],
    })
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'synced' },
    })

    const workspaces = await workspaceApi.list('test@example.com')
    expect(mockGet).toHaveBeenCalledWith('/api/workspaces?email=test%40example.com')
    expect(workspaces).toHaveLength(1)

    const syncRes = await workspaceApi.sync({
      email: 'test@example.com',
      user_id: 'u-1',
      workspaces: [{ id: 'ws-1', name: 'Production' }],
    })
    expect(mockPost).toHaveBeenCalledWith('/api/workspaces/sync', {
      email: 'test@example.com',
      user_id: 'u-1',
      workspaces: [{ id: 'ws-1', name: 'Production' }],
    })
    expect(syncRes.status).toBe('synced')
  })

  test('memoryApi and settingsApi execute successfully', async () => {
    const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [{ id: 'n-1', title: 'Top Spend' }],
    })
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { success: true },
    })

    const notebook = await memoryApi.getNotebook()
    expect(mockGet).toHaveBeenCalledWith('/api/memory/notebook')
    expect(notebook[0].title).toBe('Top Spend')

    const usage = await settingsApi.incrementUsage('queries')
    expect(mockPost).toHaveBeenCalledWith('/api/settings/usage/increment?field=queries')
    expect(usage.success).toBe(true)
  })
})

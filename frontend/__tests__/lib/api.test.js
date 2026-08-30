import {
  API_BASE_URL,
  clarificationApi,
  databaseApi,
  semanticApi,
  memoryApi,
  settingsApi,
  dashboardApi,
  apiClient,
} from '@/lib/api'

describe('Centralized Frontend API Client (lib/api.js)', () => {
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

  test('semanticApi.getMetrics and createMetric call appropriate endpoints', async () => {
    const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { metrics: [{ id: 'm-1', name: 'Net MRR' }] },
    })
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { success: true, metric: { id: 'm-2', name: 'Churn Rate' } },
    })

    const metricsRes = await semanticApi.getMetrics()
    expect(mockGet).toHaveBeenCalledWith('/api/semantic/metrics')
    expect(metricsRes.metrics).toHaveLength(1)

    const createRes = await semanticApi.createMetric({
      name: 'Churn Rate',
      definition: 'Churned users / active users',
    })
    expect(mockPost).toHaveBeenCalledWith('/api/semantic/metrics', {
      name: 'Churn Rate',
      definition: 'Churned users / active users',
    })
    expect(createRes.success).toBe(true)
  })

  test('memoryApi and settingsApi execute successfully', async () => {
    const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { queries: [{ id: 'n-1', title: 'Top Spend' }] },
    })
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { success: true },
    })

    const notebook = await memoryApi.getNotebook()
    expect(mockGet).toHaveBeenCalledWith('/api/memory/notebook')
    expect(notebook.queries[0].title).toBe('Top Spend')

    const usage = await settingsApi.incrementUsage('queries')
    expect(mockPost).toHaveBeenCalledWith('/api/settings/usage/increment?field=queries')
    expect(usage.success).toBe(true)
  })

  test('dashboardApi.generateDashboard calls /api/dashboard/generate with payload', async () => {
    const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        status: 'complete',
        dashboard_title: 'SaaS Executive Overview',
        widgets: [{ id: 'w1', title: 'MRR' }],
      },
    })

    const result = await dashboardApi.generateDashboard({
      user_prompt: 'Build me an Executive SaaS Dashboard',
      theme: 'executive',
      live_schema: 'CREATE TABLE orders (id uuid);',
      connection_uri: 'postgresql://usr:pwd@host/db',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/dashboard/generate', {
      user_prompt: 'Build me an Executive SaaS Dashboard',
      theme: 'executive',
      live_schema: 'CREATE TABLE orders (id uuid);',
      connection_uri: 'postgresql://usr:pwd@host/db',
    })
    expect(result.status).toBe('complete')
    expect(result.dashboard_title).toBe('SaaS Executive Overview')
  })

  test('dashboardApi.getTemplates calls /api/dashboard/templates', async () => {
    const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { templates: [{ id: 'saas_executive', title: 'SaaS Overview' }] },
    })

    const templates = await dashboardApi.getTemplates()
    expect(mockGet).toHaveBeenCalledWith('/api/dashboard/templates')
    expect(templates[0].id).toBe('saas_executive')
  })
})

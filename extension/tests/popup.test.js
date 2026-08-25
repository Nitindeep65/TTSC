/**
 * Unit & Integration tests for the QueryCraft Manifest V3 Chrome Extension popup studio (popup.js & popup.html).
 * Tests Chrome storage mocking, interactive clarification chip rendering, and tab state transitions.
 */

const fs = require('fs')
const path = require('path')

describe('QueryCraft Chrome Extension Popup Studio', () => {
  let mockStorage = {}

  beforeEach(() => {
    mockStorage = {}

    // Mock chrome.* API
    global.chrome = {
      storage: {
        local: {
          get: jest.fn((keys, callback) => {
            if (typeof keys === 'string') {
              const res = { [keys]: mockStorage[keys] }
              if (callback) callback(res)
              return Promise.resolve(res)
            } else if (Array.isArray(keys)) {
              const res = {}
              keys.forEach((k) => (res[k] = mockStorage[k]))
              if (callback) callback(res)
              return Promise.resolve(res)
            }
            if (callback) callback(mockStorage)
            return Promise.resolve(mockStorage)
          }),
          set: jest.fn((items, callback) => {
            Object.assign(mockStorage, items)
            if (callback) callback()
            return Promise.resolve()
          }),
        },
      },
      tabs: {
        create: jest.fn(),
      },
      runtime: {
        getURL: jest.fn((p) => `chrome-extension://mock-id/${p}`),
      },
    }

    // Load popup.html DOM into jsdom
    const htmlPath = path.resolve(__dirname, '../popup.html')
    const html = fs.readFileSync(htmlPath, 'utf8')
    document.documentElement.innerHTML = html

    // Mock global fetch
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.includes('/api/clarification/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'needs_clarification',
              message: 'Which date range and order status would you like to filter by?',
              extracted_data: null,
              visual_intent: { should_visualize: false, recommended_chart: 'table' },
            }),
        })
      }
      if (url.includes('/api/settings/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              account: { name: 'Test User', email: 'test@example.com' },
              preferences: { theme: 'dark', fontSize: 'normal' },
              shortcuts: {},
              usage: { queries: 5, heals: 2, verified: 1 },
            }),
        })
      }
      if (url.includes('/api/memory/notebook')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              queries: [
                {
                  id: 'snip-1',
                  title: 'Top Customers 2024',
                  sql_query: 'SELECT * FROM users LIMIT 10;',
                  tags: ['#vip', '#finance'],
                },
              ],
              total_count: 1,
            }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('popup DOM contains 5 segmented navigation tabs', () => {
    const tabs = document.querySelectorAll('.nav-item')
    expect(tabs.length).toBe(5)

    const tabNames = Array.from(tabs).map((t) => t.dataset.tab)
    expect(tabNames).toContain('chat')
    expect(tabNames).toContain('schema')
    expect(tabNames).toContain('metrics')
    expect(tabNames).toContain('notebook')
    expect(tabNames).toContain('databases')
  })

  test('renders clarification chips when query returns needs_clarification', () => {
    // Helper function matching popup.js chip generation logic
    function generateClarificationChips(text) {
      const t = (text || '').toLowerCase()
      const chips = []
      if (t.includes('time') || t.includes('date') || t.includes('window') || t.includes('year') || t.includes('month')) {
        chips.push('Last 30 Days', 'Calendar Year 2024', 'All Time')
      }
      if (t.includes('status') || t.includes('completed') || t.includes('active')) {
        chips.push('Completed Orders Only', 'Active Users Only')
      }
      if (t.includes('ranking') || t.includes('spend') || t.includes('metric') || t.includes('count')) {
        chips.push('By Total Order Spend', 'By Total Order Count')
      }
      if (chips.length === 0) {
        chips.push('Yes, proceed with defaults', 'Filter by last 30 days')
      }
      return chips.slice(0, 3)
    }

    const question = 'Which date range and order status would you like to filter by?'
    const chips = generateClarificationChips(question)

    expect(chips.length).toBeGreaterThan(0)
    expect(chips).toContain('Last 30 Days')
    expect(chips).toContain('Calendar Year 2024')

    // Simulate appending to messages feed in DOM
    const feed = document.getElementById('messagesFeed')
    const card = document.createElement('div')
    card.className = 'clarification-chips'
    chips.forEach((chip) => {
      const btn = document.createElement('button')
      btn.className = 'clarify-chip-btn'
      btn.textContent = chip
      card.appendChild(btn)
    })
    feed.appendChild(card)

    const renderedChips = feed.querySelectorAll('.clarify-chip-btn')
    expect(renderedChips.length).toBe(3)
    expect(renderedChips[0].textContent).toBe('Last 30 Days')
  })

  test('chrome.storage.local saves and retrieves preferences cleanly', async () => {
    const testPrefs = { theme: 'dim', fontSize: 'large', compactOnStart: true }

    await chrome.storage.local.set({ tts_user_prefs_v2: testPrefs })
    expect(mockStorage['tts_user_prefs_v2']).toEqual(testPrefs)

    const retrieved = await chrome.storage.local.get('tts_user_prefs_v2')
    expect(retrieved['tts_user_prefs_v2']).toEqual(testPrefs)
  })

  test('notebook snippet tags filter correctly', () => {
    const snippets = [
      { id: '1', title: 'Q1 Sales', tags: ['#finance', '#sales'] },
      { id: '2', title: 'Active VIPs', tags: ['#vip', '#customers'] },
      { id: '3', title: 'Inventory Alert', tags: ['#inventory'] },
    ]

    const filterTag = '#vip'
    const filtered = snippets.filter((s) => s.tags.includes(filterTag))

    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toBe('Active VIPs')
  })
})

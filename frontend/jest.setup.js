import '@testing-library/jest-dom'

// Mock Clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
})

// Mock LocalStorage API
const localStorageMock = (function () {
  let store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

// Mock axios
const mockAxiosInstance = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} }),
}

jest.mock('axios', () => ({
  __esModule: true,
  ...mockAxiosInstance,
  create: jest.fn(() => mockAxiosInstance),
  default: {
    ...mockAxiosInstance,
    create: jest.fn(() => mockAxiosInstance),
  },
}))

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

import '@testing-library/jest-dom'

// Mock global fetch
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
    })
  )
}

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
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
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

// Mock Firebase Web SDK for fast unit testing
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}))

jest.mock('firebase/auth', () => {
  function MockAuthProvider() {
    this.setCustomParameters = jest.fn()
  }
  return {
    getAuth: jest.fn(() => ({})),
    GoogleAuthProvider: jest.fn().mockImplementation(MockAuthProvider),
    GithubAuthProvider: jest.fn().mockImplementation(MockAuthProvider),
    signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: 'test-user-123',
        email: 'alex@querycraft.dev',
        displayName: 'Alex Rivera',
      },
    })
  ),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: 'test-user-456',
        email: 'sofia@cloudscale.io',
        displayName: 'Sofia Davis',
      },
    })
  ),
  signInWithPopup: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: 'test-oauth-789',
        email: 'oauth@querycraft.dev',
        displayName: 'OAuth User',
      },
    })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((auth, cb) => {
    return () => {}
  }),
}
})

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

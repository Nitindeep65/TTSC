import { isSoundEnabled, setSoundEnabled, playExtensionPromptSound, playSuccessSound, resetAudioContext } from "@/lib/soundUtils"

describe("soundUtils Web Audio API Synthesizer", () => {
  let originalAudioContext
  let mockGainNode
  let mockOscillatorNode
  let mockAudioContext

  beforeEach(() => {
    localStorage.clear()
    resetAudioContext()

    mockGainNode = {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    }

    mockOscillatorNode = {
      type: "sine",
      frequency: {
        setValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    }

    mockAudioContext = {
      currentTime: 100,
      state: "running",
      destination: {},
      createGain: jest.fn(() => ({ ...mockGainNode })),
      createOscillator: jest.fn(() => ({ ...mockOscillatorNode })),
      resume: jest.fn().mockResolvedValue(),
    }

    originalAudioContext = window.AudioContext
    window.AudioContext = jest.fn(() => mockAudioContext)
  })

  afterEach(() => {
    window.AudioContext = originalAudioContext
    jest.clearAllMocks()
  })

  test("sound preference defaults to true and can be toggled", () => {
    expect(isSoundEnabled()).toBe(true)
    setSoundEnabled(false)
    expect(isSoundEnabled()).toBe(false)
    setSoundEnabled(true)
    expect(isSoundEnabled()).toBe(true)
  })

  test("plays extension prompt chime with oscillators when enabled", () => {
    setSoundEnabled(true)
    playExtensionPromptSound()
    expect(window.AudioContext).toHaveBeenCalled()
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    expect(mockAudioContext.createGain).toHaveBeenCalled()
  })

  test("does not trigger audio when sound is disabled", () => {
    setSoundEnabled(false)
    playExtensionPromptSound()
    // AudioContext shouldn't be initialized if sound is disabled
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
  })

  test("plays success sound chime", () => {
    setSoundEnabled(true)
    playSuccessSound()
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
  })
})

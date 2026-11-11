import { describe, expect, it, vi } from 'vitest'
import { AudioEngine } from '../../src/services/audio'

describe('ambient audio volume', () => {
  it('routes ambience through an independent gain and applies its setting', () => {
    const gains: Array<{ gain: { value: number; setTargetAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn> }> = []

    class FakeAudioContext {
      currentTime = 5
      state: AudioContextState = 'running'
      destination = {}

      createGain() {
        const gain = { value: 0, setTargetAtTime: vi.fn() }
        const node = { gain, connect: vi.fn() }
        gains.push(node)
        return node
      }

      createOscillator() {
        return {
          type: 'sine' as OscillatorType,
          frequency: { value: 0 },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        }
      }

      createBiquadFilter() {
        return { type: 'lowpass' as BiquadFilterType, frequency: { value: 0 }, connect: vi.fn() }
      }
    }

    const previousAudioContext = Object.getOwnPropertyDescriptor(window, 'AudioContext')
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext as unknown as typeof AudioContext,
    })

    try {
      const engine = new AudioEngine()
      engine.configure({ musicVolume: 0.8, sfxVolume: 0.6, ambientVolume: 0.4, muted: false })
      engine.unlock()
      engine.startAmbient()

      const ambientBus = gains[3]
      const ambientVoices = [gains[4], gains[6], gains[8]]
      expect(ambientBus.gain.value).toBe(0.2)
      expect(ambientVoices).toHaveLength(3)
      expect(ambientVoices.every((voice) => voice.connect.mock.calls.some(([target]) => target === ambientBus))).toBe(
        true,
      )

      engine.configure({ musicVolume: 0.8, sfxVolume: 0.6, ambientVolume: 0.2, muted: false })
      expect(ambientBus.gain.setTargetAtTime).toHaveBeenCalledWith(0.1, 5, 0.2)
      expect(gains[1].gain.setTargetAtTime).toHaveBeenCalledWith(0.4, 5, 0.2)

      engine.stopAmbient()
    } finally {
      if (previousAudioContext) Object.defineProperty(window, 'AudioContext', previousAudioContext)
      else delete (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext
    }
  })
})

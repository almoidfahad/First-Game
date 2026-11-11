/**
 * Procedural audio. Nothing is streamed and no audio files are downloaded: all
 * sound is synthesised with the Web Audio API, so it works offline and adds zero
 * bytes to the service-worker cache.
 */

type Cue = 'click' | 'confirm' | 'error' | 'card' | 'alert'

interface AudioState {
  musicVolume: number
  sfxVolume: number
  ambientVolume: number
  muted: boolean
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private musicGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private ambientGain: GainNode | null = null
  private ambient: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode }[] = []
  private settings: AudioState = { musicVolume: 0.35, sfxVolume: 0.5, ambientVolume: 0.35, muted: false }
  private started = false

  configure(settings: AudioState): void {
    this.settings = settings
    if (!this.ctx) return
    const now = this.ctx.currentTime
    this.musicGain?.gain.setTargetAtTime(settings.muted ? 0 : settings.musicVolume * 0.5, now, 0.2)
    this.sfxGain?.gain.setTargetAtTime(settings.muted ? 0 : settings.sfxVolume * 0.6, now, 0.1)
    this.ambientGain?.gain.setTargetAtTime(settings.muted ? 0 : settings.ambientVolume * 0.5, now, 0.2)
  }

  /** Must be called from a user gesture before anything can be heard. */
  unlock(): void {
    this.ensureContext()
    if (this.ctx?.state === 'suspended') void this.ctx.resume()
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (this.ctx) return this.ctx
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = 0.9
      master.connect(ctx.destination)
      const music = ctx.createGain()
      music.gain.value = this.settings.muted ? 0 : this.settings.musicVolume * 0.5
      music.connect(master)
      const sfx = ctx.createGain()
      sfx.gain.value = this.settings.muted ? 0 : this.settings.sfxVolume * 0.6
      sfx.connect(master)
      const ambient = ctx.createGain()
      ambient.gain.value = this.settings.muted ? 0 : this.settings.ambientVolume * 0.5
      ambient.connect(master)
      this.ctx = ctx
      this.musicGain = music
      this.sfxGain = sfx
      this.ambientGain = ambient
      return ctx
    } catch {
      return null
    }
  }

  startAmbient(): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.ambientGain || this.started) return
    this.started = true
    // Two detuned drones and a slow filter LFO: a city breathing in the dark.
    const frequencies = [55, 82.5, 110]
    for (const frequency of frequencies) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = frequency
      filter.type = 'lowpass'
      filter.frequency.value = 320
      gain.gain.value = 0.16
      lfo.frequency.value = 0.06 + frequency / 4000
      lfoGain.gain.value = 90
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ambientGain)
      osc.start()
      lfo.start()
      this.ambient.push({ osc, lfo, gain })
    }
  }

  stopAmbient(): void {
    for (const node of this.ambient) {
      try {
        node.osc.stop()
        node.lfo.stop()
      } catch {
        // Already stopped.
      }
    }
    this.ambient = []
    this.started = false
  }

  play(cue: Cue): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain || this.settings.muted) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const tones: Record<Cue, { freq: number; type: OscillatorType; length: number; volume: number }> = {
      click: { freq: 520, type: 'triangle', length: 0.06, volume: 0.18 },
      confirm: { freq: 680, type: 'sine', length: 0.14, volume: 0.22 },
      error: { freq: 180, type: 'sawtooth', length: 0.18, volume: 0.16 },
      card: { freq: 420, type: 'triangle', length: 0.1, volume: 0.15 },
      alert: { freq: 300, type: 'square', length: 0.22, volume: 0.12 },
    }
    const tone = tones[cue]
    osc.type = tone.type
    osc.frequency.setValueAtTime(tone.freq, now)
    if (cue === 'confirm') osc.frequency.exponentialRampToValueAtTime(tone.freq * 1.5, now + tone.length)
    if (cue === 'error') osc.frequency.exponentialRampToValueAtTime(tone.freq * 0.6, now + tone.length)
    gain.gain.setValueAtTime(tone.volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.length)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(now)
    osc.stop(now + tone.length + 0.02)
  }

  stinger(kind: 'victory' | 'defeat' | 'alert' | 'click'): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain || this.settings.muted) return
    if (kind === 'click') {
      this.play('click')
      return
    }
    const now = ctx.currentTime
    const notes = kind === 'victory' ? [392, 523.25, 659.25, 783.99] : kind === 'defeat' ? [261.6, 207.7, 155.6] : [440, 330]
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + index * 0.16
      osc.type = kind === 'defeat' ? 'sawtooth' : 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45)
      osc.connect(gain)
      gain.connect(this.sfxGain!)
      osc.start(start)
      osc.stop(start + 0.5)
    })
  }
}

export const audio = new AudioEngine()

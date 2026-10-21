// soundEffects.ts
// Synthesizes pleasant market chime and gavel sounds using Web Audio API

class SoundService {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  // Crisp dual-tone chime when a bid is placed
  public playBidChime() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, now) // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12) // A5

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(880, now + 0.05)
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22) // D6

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(this.ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.05)
      osc1.stop(now + 0.35)
      osc2.stop(now + 0.35)
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  // Outbid alert tone
  public playOutbidAlert() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.25) // E4 drop

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.3)
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  // Coastal auction gavel strike (sound of wooden hammer)
  public playGavelStrike() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      // Primary impact
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.25)

      // Second reverberation tap
      setTimeout(() => {
        try {
          if (!this.ctx) return
          const t2 = this.ctx.currentTime
          const o2 = this.ctx.createOscillator()
          const g2 = this.ctx.createGain()
          o2.type = 'sine'
          o2.frequency.setValueAtTime(220, t2)
          o2.frequency.exponentialRampToValueAtTime(60, t2 + 0.12)
          g2.gain.setValueAtTime(0.2, t2)
          g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.2)
          o2.connect(g2)
          g2.connect(this.ctx.destination)
          o2.start(t2)
          o2.stop(t2 + 0.2)
        } catch {}
      }, 130)
    } catch {
      // Audio autoplay policy or unavailable
    }
  }
}

export const soundEffects = new SoundService()

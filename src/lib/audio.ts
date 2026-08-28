// src/lib/audio.ts
// Programmatic Web Audio API sound synthesizer for zero-dependency mission control audio

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeSirenOsc: OscillatorNode | null = null;
  private activeSirenGain: GainNode | null = null;

  constructor() {
    // Initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopGuardianSiren();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopGuardianSiren();
    }
  }

  // Gate Scan Success: Dual tone sci-fi confirmation chime
  public playScanSuccess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, now + 0.05); // E6
    osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  // Gate Scan Error / Reject: Low buzz alarm
  public playScanError() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(140, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Warning Alert: Pulse double beep
  public playWarningAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.15].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now + delay);
      osc.frequency.exponentialRampToValueAtTime(880, now + delay + 0.08);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    });
  }

  // Critical Alert: Mission Control Red Emergency Sweep
  public playCriticalAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.25, 0.5].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now + delay);
      osc.frequency.linearRampToValueAtTime(450, now + delay + 0.2);

      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.22);
    });
  }

  // Guardian Mode Anti-Theft Siren (Continuous oscillation)
  public startGuardianSiren() {
    if (this.isMuted || this.activeSirenOsc) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const masterGain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(850, now);

    // LFO for wailing pitch modulation
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2.5, now); // 2.5 sweeps per second
    lfoGain.gain.setValueAtTime(350, now); // swing between 500Hz and 1200Hz

    lfo.connect(osc.frequency);

    masterGain.gain.setValueAtTime(0.3, now);

    osc.connect(masterGain);
    masterGain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);

    this.activeSirenOsc = osc;
    this.activeSirenGain = masterGain;
  }

  public stopGuardianSiren() {
    if (this.activeSirenOsc) {
      try {
        this.activeSirenOsc.stop();
        this.activeSirenOsc.disconnect();
      } catch (e) {}
      this.activeSirenOsc = null;
      this.activeSirenGain = null;
    }
  }
}

export const soundManager = new SoundManager();

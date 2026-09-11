/**
 * Original tracker. Two slow themes (hall + sail) overlay when the brick
 * is quiet; a speed jump is more likely to swap which one leads.
 * Not the Tron Legacy score (Overture / Solar Sailer are copyrighted).
 */

export type Load = { util: number; power: number; hot: boolean };
export type Lead = 'hall' | 'sail';

function clamp(n: number, a: number, b: number) {
	return Math.max(a, Math.min(b, n));
}

function heatOf(load: Load) {
	return clamp(load.util / 100, 0, 1) * 0.7 + (load.hot ? 0.3 : 0);
}

export class BayTracker {
	ctx: AudioContext | null = null;
	onLead: ((lead: Lead) => void) | null = null;
	lead: Lead = 'hall';
	muted = true;
	bpm = 72;

	private master: GainNode | null = null;
	private filter: BiquadFilterNode | null = null;
	private delay: DelayNode | null = null;
	private timer = 0;
	private step = 0;
	private load: Load = { util: 0, power: 26, hot: false };
	private lastHeat = 0;

	get running() {
		return Boolean(this.ctx && this.ctx.state === 'running' && !this.muted);
	}

	async arm() {
		if (!this.ctx) {
			const ctx = new AudioContext();
			const filter = ctx.createBiquadFilter();
			filter.type = 'lowpass';
			filter.frequency.value = 1100;
			filter.Q.value = 0.65;
			const delay = ctx.createDelay(1.2);
			delay.delayTime.value = 0.32;
			const fb = ctx.createGain();
			fb.gain.value = 0.32;
			delay.connect(fb);
			fb.connect(delay);
			const wet = ctx.createGain();
			wet.gain.value = 0.22;
			delay.connect(wet);
			const master = ctx.createGain();
			master.gain.value = 0.11;
			filter.connect(master);
			wet.connect(master);
			master.connect(ctx.destination);
			this.ctx = ctx;
			this.filter = filter;
			this.delay = delay;
			this.master = master;
		}
		if (this.ctx.state === 'suspended') await this.ctx.resume();
		this.muted = false;
		if (this.master) this.master.gain.setTargetAtTime(0.11, this.ctx.currentTime, 0.05);
		if (!this.timer) this.tick();
	}

	mute() {
		this.muted = true;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = 0;
		}
		if (this.master && this.ctx) {
			this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
		}
	}

	setLoad(load: Load) {
		this.load = load;
		const heat = heatOf(load);
		const delta = Math.abs(heat - this.lastHeat);
		if (delta > 0.06) {
			const p = clamp(0.18 + delta * 2.4, 0.18, 0.9);
			if (Math.random() < p) {
				this.lead = this.lead === 'hall' ? 'sail' : 'hall';
				this.onLead?.(this.lead);
			}
		}
		this.lastHeat = heat;
		this.bpm = heat < 0.28 ? 58 + heat * 40 : 84 + heat * 72;
		if (this.filter && this.ctx) {
			const f = 640 + heat * 2600 + clamp(load.power / 400, 0, 1) * 700;
			this.filter.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.25);
		}
		if (this.master && this.ctx && !this.muted) {
			this.master.gain.setTargetAtTime(0.1 + heat * 0.04, this.ctx.currentTime, 0.15);
		}
	}

	private tick = () => {
		if (!this.ctx || this.muted) return;
		const t = this.ctx.currentTime;
		const s = this.step % 16;
		this.voice(s, t);
		this.step += 1;
		const ms = (60 / this.bpm) * 250;
		this.timer = window.setTimeout(this.tick, ms);
	};

	private voice(s: number, t: number) {
		const ctx = this.ctx;
		const dest = this.filter;
		const delay = this.delay;
		if (!ctx || !dest || !delay) return;
		const heat = heatOf(this.load);
		const slow = heat < 0.32;
		const hallLead = this.lead === 'hall';

		if (slow) {
			if (s === 0) this.kick(ctx, dest, t, 0.55);
			if (s === 8) this.kick(ctx, dest, t, 0.28);
			if (s % 8 === 4) this.hat(ctx, dest, t, 0.018);
			this.hall(ctx, dest, s, t, hallLead ? 0.11 : 0.045);
			this.sail(ctx, dest, delay, s, t, hallLead ? 0.028 : 0.07);
			return;
		}

		if (s % 4 === 0) this.kick(ctx, dest, t, 0.85);
		if (s === 4 || s === 12) this.snare(ctx, dest, t);
		if (s % 2 === 0) this.hat(ctx, dest, t, s % 4 === 0 ? 0.04 : 0.025);
		this.hall(ctx, dest, s, t, hallLead ? 0.07 : 0.03);
		this.sail(ctx, dest, delay, s, t, hallLead ? 0.035 : 0.055);
	}

	/** Slow brass-pad motif. Original — not the Overture. */
	private hall(ctx: AudioContext, dest: AudioNode, s: number, t: number, amp: number) {
		const bass = [36, 36, 43, 39, 36, 31, 39, 43];
		this.tone(ctx, dest, t, bass[s % 8], 'triangle', amp, 0.22);
		if (s % 4 === 0) {
			const chord = [48, 51, 55, 58][Math.floor(s / 4) % 4];
			this.tone(ctx, dest, t, chord, 'sawtooth', amp * 0.45, 0.55);
			this.tone(ctx, dest, t, chord + 7, 'sawtooth', amp * 0.22, 0.5);
		}
	}

	/** Flowing pentatonic arp. Original — not Solar Sailer. */
	private sail(ctx: AudioContext, dest: AudioNode, delay: DelayNode, s: number, t: number, amp: number) {
		const arp = [64, 67, 71, 74, 71, 67, 62, 64, 67, 71, 67, 62, 59, 62, 64, 67];
		this.tone(ctx, dest, t, arp[s % 16], 'square', amp, 0.11);
		this.tone(ctx, delay, t, arp[(s + 3) % 16], 'sine', amp * 0.7, 0.16);
	}

	private kick(ctx: AudioContext, dest: AudioNode, t: number, amp: number) {
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(140, t);
		o.frequency.exponentialRampToValueAtTime(42, t + 0.09);
		g.gain.setValueAtTime(amp, t);
		g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
		o.connect(g);
		g.connect(dest);
		o.start(t);
		o.stop(t + 0.18);
	}

	private snare(ctx: AudioContext, dest: AudioNode, t: number) {
		const n = ctx.createBufferSource();
		const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
		n.buffer = buf;
		const g = ctx.createGain();
		g.gain.setValueAtTime(0.22, t);
		g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
		n.connect(g);
		g.connect(dest);
		n.start(t);
		n.stop(t + 0.14);
	}

	private hat(ctx: AudioContext, dest: AudioNode, t: number, amp: number) {
		const n = ctx.createBufferSource();
		const buf = ctx.createBuffer(1, 2048, ctx.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
		n.buffer = buf;
		const f = ctx.createBiquadFilter();
		f.type = 'highpass';
		f.frequency.value = 7000;
		const g = ctx.createGain();
		g.gain.setValueAtTime(amp, t);
		g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
		n.connect(f);
		f.connect(g);
		g.connect(dest);
		n.start(t);
		n.stop(t + 0.05);
	}

	private tone(
		ctx: AudioContext,
		dest: AudioNode,
		t: number,
		midi: number,
		type: OscillatorType,
		amp: number,
		dur: number
	) {
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.type = type;
		o.frequency.value = 440 * 2 ** ((midi - 69) / 12);
		g.gain.setValueAtTime(amp, t);
		g.gain.exponentialRampToValueAtTime(0.001, t + dur);
		o.connect(g);
		g.connect(dest);
		o.start(t);
		o.stop(t + dur + 0.02);
	}

	dispose() {
		this.mute();
		void this.ctx?.close();
		this.ctx = null;
	}
}

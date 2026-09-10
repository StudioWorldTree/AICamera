/**
 * Original lightcycle tracker. Not the Tron Legacy score.
 * Tempo and filter follow GPU load. Requires a user gesture to start.
 */

export type Load = { util: number; power: number; hot: boolean };

function clamp(n: number, a: number, b: number) {
	return Math.max(a, Math.min(b, n));
}

export class BayTracker {
	ctx: AudioContext | null = null;
	private master: GainNode | null = null;
	private filter: BiquadFilterNode | null = null;
	private timer = 0;
	private step = 0;
	muted = true;
	bpm = 88;
	private load: Load = { util: 0, power: 26, hot: false };

	get running() {
		return Boolean(this.ctx && this.ctx.state === 'running' && !this.muted);
	}

	async arm() {
		if (!this.ctx) {
			const ctx = new AudioContext();
			const filter = ctx.createBiquadFilter();
			filter.type = 'lowpass';
			filter.frequency.value = 900;
			filter.Q.value = 0.7;
			const master = ctx.createGain();
			master.gain.value = 0.11;
			filter.connect(master);
			master.connect(ctx.destination);
			this.ctx = ctx;
			this.filter = filter;
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
		const heat = clamp(load.util / 100, 0, 1) * 0.7 + (load.hot ? 0.3 : 0);
		this.bpm = 84 + heat * 72;
		if (this.filter && this.ctx) {
			const f = 700 + heat * 2800 + clamp(load.power / 400, 0, 1) * 800;
			this.filter.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.2);
		}
		if (this.master && this.ctx && !this.muted) {
			this.master.gain.setTargetAtTime(0.1 + heat * 0.05, this.ctx.currentTime, 0.15);
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
		if (!ctx || !dest) return;
		const hot = this.load.hot;
		if (s % 4 === 0) this.kick(ctx, dest, t);
		if (s === 4 || s === 12) this.snare(ctx, dest, t);
		if (s % 2 === 0) this.hat(ctx, dest, t, s % 4 === 0 ? 0.04 : 0.025);
		const bass = [36, 36, 43, 38, 36, 31, 38, 43];
		this.tone(ctx, dest, t, bass[s % 8], 'triangle', 0.09, 0.18);
		if (hot || s % 2 === 1) {
			const arp = [69, 72, 76, 79, 76, 72];
			this.tone(ctx, dest, t, arp[s % 6], 'square', 0.03, 0.09);
		}
	}

	private kick(ctx: AudioContext, dest: AudioNode, t: number) {
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(140, t);
		o.frequency.exponentialRampToValueAtTime(42, t + 0.09);
		g.gain.setValueAtTime(0.9, t);
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

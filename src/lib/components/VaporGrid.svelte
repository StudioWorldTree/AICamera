<script lang="ts">
	import { onMount } from 'svelte';

	let { speed = 1, hot = false }: { speed?: number; hot?: boolean } = $props();

	let canvas: HTMLCanvasElement | undefined;
	let raf = 0;
	let spd = $state(1);
	let lit = $state(false);

	$effect(() => {
		spd = speed;
		lit = hot;
	});

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ctx = canvas?.getContext('2d');
		if (!ctx || !canvas) return;
		let t = 0;
		let last = performance.now();
		const draw = (now: number) => {
			const c = canvas;
			if (!c || !ctx) return;
			const w = (c.width = Math.max(1, c.clientWidth) * devicePixelRatio);
			const h = (c.height = Math.max(1, c.clientHeight) * devicePixelRatio);
			const dt = reduce ? 0 : ((now - last) / 1000) * spd;
			last = now;
			t += dt;
			sky(ctx, w, h, lit);
			sun(ctx, w, h, lit);
			grid(ctx, w, h, t, lit);
			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	});

	function sky(ctx: CanvasRenderingContext2D, w: number, h: number, lit: boolean) {
		const g = ctx.createLinearGradient(0, 0, 0, h);
		g.addColorStop(0, lit ? '#1a0530' : '#12081c');
		g.addColorStop(0.45, lit ? '#3a0a4a' : '#241028');
		g.addColorStop(1, '#0a080c');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
	}

	function sun(ctx: CanvasRenderingContext2D, w: number, h: number, lit: boolean) {
		const cx = w * 0.82;
		const cy = h * 0.34;
		const r = Math.min(w, h) * 0.32;
		const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
		g.addColorStop(0, lit ? '#ffd08a' : '#e2a45a');
		g.addColorStop(0.45, '#ff3ec8');
		g.addColorStop(1, 'rgba(18,8,28,0)');
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.save();
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.clip();
		ctx.fillStyle = '#12081c';
		const gap = h * 0.035;
		for (let y = cy; y < cy + r; y += gap) {
			ctx.fillRect(0, y, w, gap * 0.45);
		}
		ctx.restore();
	}

	function grid(ctx: CanvasRenderingContext2D, w: number, h: number, phase: number, lit: boolean) {
		const horizon = h * 0.48;
		ctx.strokeStyle = lit ? 'rgba(62,240,255,0.45)' : 'rgba(226,164,90,0.22)';
		ctx.lineWidth = Math.max(1, devicePixelRatio);
		const rows = 14;
		for (let i = 0; i < rows; i++) {
			const u = (i + (phase % 1)) / rows;
			const y = horizon + (h - horizon) * u * u;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}
		const vanishX = w * 0.5;
		for (let i = -12; i <= 12; i++) {
			const x0 = vanishX + i * (w / 10);
			ctx.beginPath();
			ctx.moveTo(vanishX, horizon);
			ctx.lineTo(x0, h);
			ctx.stroke();
		}
	}
</script>

<canvas bind:this={canvas} class="vapor" aria-hidden="true"></canvas>

<style>
	.vapor {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		z-index: 0;
	}
</style>

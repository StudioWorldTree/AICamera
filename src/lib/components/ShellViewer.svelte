<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { ShellHandle } from '$lib/cad/mount-shell';

	let canvas = $state<HTMLCanvasElement>();
	let status = $state<'idle' | 'loading' | 'live' | 'failed'>('idle');
	let handle: ShellHandle | null = null;
	let loader: Promise<typeof import('$lib/cad/mount-shell')> | null = null;

	const poster = `${base}/media/cad-preview.png`;
	const glb = `${base}/media/hero.glb`;
	const decoderPath = `${base}/draco/`;
	const stls = [`${base}/media/agx_shell_front.stl`, `${base}/media/agx_shell_rear.stl`];

	function warm() {
		loader ??= import('$lib/cad/mount-shell');
	}

	async function activate() {
		if (status === 'loading' || status === 'live' || !canvas) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		status = 'loading';
		try {
			warm();
			const { mountShell } = await loader!;
			try {
				handle = await mountShell(canvas, {
					glb,
					decoderPath,
					interactive: !reduce
				});
			} catch {
				handle = await mountShell(canvas, { stls, interactive: !reduce });
			}
			status = 'live';
		} catch (err) {
			console.error(err);
			status = 'failed';
		}
	}

	onMount(() => {
		warm();
		activate();
	});

	onDestroy(() => {
		handle?.dispose();
		handle = null;
	});
</script>

<div class="stage">
	{#if status !== 'live'}
		<img
			src={poster}
			alt="All Systems Go camera body."
			width="1600"
			height="900"
		/>
	{/if}
	<canvas
		bind:this={canvas}
		class:ready={status === 'live'}
		aria-label="All Systems Go camera. Drag to orbit."
	></canvas>
	{#if status === 'loading'}
		<p class="arm" aria-live="polite">Lighting the body…</p>
	{:else if status === 'failed'}
		<p class="arm">Couldn’t load WebGL. Static view stays.</p>
	{:else if status === 'live'}
		<p class="hint">Drag to orbit</p>
	{/if}
</div>

<style>
	.stage {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #14161c;
		overflow: hidden;
	}

	img,
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	canvas {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
	}

	canvas.ready {
		opacity: 1;
		pointer-events: auto;
		cursor: grab;
	}

	canvas.ready:active {
		cursor: grabbing;
	}

	.arm,
	.hint {
		position: absolute;
		right: 0.7rem;
		bottom: 0.7rem;
		z-index: 1;
		margin: 0;
		background: color-mix(in oklch, var(--bg) 82%, transparent);
		color: var(--ink-2);
		border: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.4rem 0.6rem;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		canvas.ready {
			cursor: default;
			pointer-events: none;
		}
		.hint {
			display: none;
		}
	}
</style>

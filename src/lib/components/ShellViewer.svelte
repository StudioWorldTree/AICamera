<script lang="ts">
	import { onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import type { ShellHandle } from '$lib/cad/mount-shell';

	let canvas = $state<HTMLCanvasElement>();
	let status = $state<'idle' | 'loading' | 'live' | 'failed'>('idle');
	let handle: ShellHandle | null = null;

	const poster = `${base}/media/cad-preview.png`;
	const stls = [`${base}/media/agx_shell_front.stl`, `${base}/media/agx_shell_rear.stl`];

	async function activate() {
		if (status === 'loading' || status === 'live' || !canvas) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		status = 'loading';
		try {
			const { mountShell } = await import('$lib/cad/mount-shell');
			handle = await mountShell(canvas, stls);
			status = 'live';
		} catch (err) {
			console.error(err);
			status = 'failed';
		}
	}

	onDestroy(() => {
		handle?.dispose();
		handle = null;
	});
</script>

<div
	class="stage"
	onclick={() => {
		if (status === 'idle' || status === 'failed') activate();
	}}
	onkeydown={(e) => {
		if ((e.key === 'Enter' || e.key === ' ') && (status === 'idle' || status === 'failed')) {
			e.preventDefault();
			activate();
		}
	}}
	role="presentation"
>
	<img
		src={poster}
		alt="Top view of the two-part AGX Thor resin shell, camera boss on the left, cable-exit half on the right."
		width="1600"
		height="900"
		class:hidden={status === 'live'}
	/>
	<canvas
		bind:this={canvas}
		class:ready={status === 'live'}
		aria-label="Interactive AGX Thor shell. Drag to orbit."
	></canvas>
	{#if status !== 'live'}
		<button type="button" class="arm" onclick={activate} aria-label="Load 3D shell and orbit">
			{#if status === 'loading'}
				Loading shell…
			{:else if status === 'failed'}
				Couldn’t load WebGL. Static view stays.
			{:else}
				Click to orbit
			{/if}
		</button>
	{/if}
</div>

<style>
	.stage {
		position: relative;
		aspect-ratio: 16 / 9;
		background: var(--bg-3);
		overflow: hidden;
		cursor: pointer;
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

	.hidden {
		visibility: hidden;
	}

	.arm {
		position: absolute;
		right: 0.7rem;
		bottom: 0.7rem;
		z-index: 1;
		background: var(--bg);
		color: var(--ink);
		border: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.45rem 0.65rem;
		min-height: 44px;
		cursor: pointer;
	}

	@media (prefers-reduced-motion: reduce) {
		.arm {
			display: none;
		}
		.stage {
			cursor: default;
		}
	}
</style>

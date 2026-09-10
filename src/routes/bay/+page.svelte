<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import plate from '$lib/bay/last-plate.json';
	import { BANDWIDTH_K, FILTER_K } from '$lib/bay/t4000';
	import type { BayPlate, BayView } from '$lib/bay/types';

	const plateView: BayView = { ...(plate as BayPlate), feed: 'plate' };
	let view = $state<BayView>(plateView);
	let tick = $state(0);

	const magName: Record<string, string> = {
		'sam2-tiny': 'SAM2',
		'clip-vit-b32': 'CLIP',
		'flux2-klein-4b': 'KLEIN'
	};

	async function pull() {
		if (!import.meta.env.DEV) {
			view = plateView;
			return;
		}
		try {
			const r = await fetch('/bay-api/loadout.json', { signal: AbortSignal.timeout(2500) });
			if (!r.ok) throw new Error(String(r.status));
			const data = (await r.json()) as BayPlate;
			view = { ...data, feed: 'live' };
		} catch {
			view = { ...plateView, feed: 'dark' };
		}
	}

	onMount(() => {
		pull();
		const id = setInterval(() => {
			tick += 1;
			pull();
		}, 3000);
		return () => clearInterval(id);
	});

	const vramPct = $derived(
		view.gpu.vram_total_mib ? (100 * view.gpu.vram_used_mib) / view.gpu.vram_total_mib : 0
	);
	const ramPct = $derived(
		view.ram.total_gb ? (100 * (view.ram.total_gb - view.ram.avail_gb)) / view.ram.total_gb : 0
	);
	const hot = $derived(view.gpu.util_pct > 2 || view.ai_on_tube || view.gpu.power_w > 80);
	const cap = $derived(view.gpu.power_limit_w || 0);
	const plateDay = $derived((view.ts || '').slice(0, 10));
	const slate = $derived(
		view.feed === 'live' ? 'LIVE' : view.feed === 'dark' ? 'BRICK DARK' : `PLATE ${plateDay}`
	);
	const vramGb = $derived((view.gpu.vram_used_mib / 1024).toFixed(2));
	const vramTot = $derived((view.gpu.vram_total_mib / 1024).toFixed(1));
</script>

<svelte:head>
	<title>Bay — AICamera</title>
	<meta
		name="description"
		content="Fractal1 brick EVF: VRAM, RAM, zram vs disk, stacked models. Dark-locked."
	/>
	{@html `<style>
@font-face{font-family:'Space Age';src:url('${base}/fonts/space-age.ttf') format('truetype');font-display:swap}
@font-face{font-family:'Tactic ExtExd Black';src:url('${base}/fonts/TacticSansExtExd-Blk.otf') format('opentype');font-display:swap}
@font-face{font-family:'Tactic Sans';src:url('${base}/fonts/TacticSans-Reg.otf') format('opentype');font-display:swap}
</style>`}
</svelte:head>

<div class="bay" data-hot={hot ? '1' : '0'}>
	<div class="scan" aria-hidden="true"></div>
	<header class="top">
		<div class="brand">
			<span class="lock">BAY</span>
			<span class="host">{view.host}</span>
		</div>
		<div class="slate">
			<span class="tally" class:lit={hot} title={hot ? 'compute' : 'idle'}></span>
			<span class="mode">{hot ? 'ROLLING' : 'HOLD'}</span>
			<span class="feed">{slate}</span>
		</div>
	</header>

	<section class="hero">
		<div class="readout">
			<p class="kicker">VRAM</p>
			<p class="digits">{vramGb}<span class="unit"> / {vramTot}</span></p>
			<p class="sub">GiB on the 3090</p>
		</div>
		<div class="readout watts">
			<p class="kicker">DRAW</p>
			<p class="digits">{view.gpu.power_w.toFixed(1)}<span class="unit"> W</span></p>
			<p class="sub">cap {cap.toFixed(0)} · persist {view.gpu.persistence ? 'on' : 'off'}</p>
		</div>
		<div class="wave" aria-label="VRAM waveform {vramPct.toFixed(0)} percent">
			<div class="fill" style="width: {Math.min(100, vramPct)}%"></div>
			<div class="ticks" aria-hidden="true"></div>
			<p class="wave-lab">{vramPct.toFixed(1)}% · util {view.gpu.util_pct}%</p>
		</div>
	</section>

	<section class="mags">
		<h2>Mag rack</h2>
		<ul>
			{#each view.stack as mag (mag.id)}
				<li class:in={mag.resident} data-mag={mag.id}>
					<span class="slot">{magName[mag.id] ?? mag.id}</span>
					<span class="role">{mag.role}</span>
					<span class="state">ON CART</span>
					<span class="size"
						>{mag.weights_gb ? mag.weights_gb.toFixed(1) : mag.cache_gb.toFixed(1)} GB</span
					>
				</li>
			{/each}
		</ul>
		<p class="note">
			{view.ai_on_tube ? 'AI on the tube — process-level, not per mag.' : 'One mag in the gate. 16 GB host — unload before klein.'}
		</p>
	</section>

	<section class="meters">
		<div class="card">
			<h2>Host RAM</h2>
			<p class="digits sm">{view.ram.avail_gb.toFixed(1)}<span class="unit">&nbsp;free</span></p>
			<div class="bar"><i style="width: {Math.min(100, ramPct)}%"></i></div>
			<p class="sub">{view.ram.total_gb.toFixed(1)} GB · committed {view.ram.committed_gb.toFixed(1)}</p>
		</div>
		<div class="card">
			<h2>Zram</h2>
			<p class="digits sm">{view.swap.zram_used_mb.toFixed(0)}<span class="unit"> MB</span></p>
			<p class="sub">compressed RAM · {view.swap.zram_size_gb.toFixed(1)} GB pool · not disk</p>
		</div>
		<div class="card">
			<h2>Disk swap</h2>
			<p class="digits sm">{view.swap.disk_used_mb.toFixed(1)}<span class="unit"> MB</span></p>
			<p class="sub">/swap/swapfile · {view.swap.disk_size_gb.toFixed(0)} GB · paging to disk</p>
		</div>
	</section>

	<section class="procs">
		<h2>On the tube</h2>
		{#if view.gpu.procs.length}
			<ul>
				{#each view.gpu.procs as p (p.pid)}
					<li>
						<span class="kind">{p.kind}</span>
						<span class="nm">{p.name}</span>
						<span class="mib">{p.mib} MiB</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="sub">No GPU clients.</p>
		{/if}
	</section>

	<footer class="tail">
		<p>
			{view.gpu.name || 'RTX 3090'} · {view.kernel} · {view.ts}
		</p>
		<p>
			T4000 read · filters ×{FILTER_K} · SAM2/LLM ×{BANDWIDTH_K} · {view.feed === 'live'
				? 'vite live'
				: view.feed === 'dark'
					? 'brick dark'
					: 'last plate'}
			{#if tick > 0 && view.feed === 'live'}
				· {tick}
			{/if}
		</p>
	</footer>
</div>

<style>
	.bay {
		position: relative;
		isolation: isolate;
		padding: 1.25rem 1.1rem 2.5rem;
		max-width: 72rem;
		margin: 0 auto;
		font-family: 'Tactic Sans', ui-sans-serif, sans-serif;
		overflow: hidden;
	}

	.scan {
		pointer-events: none;
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent 0 2px,
			rgba(226, 164, 90, 0.035) 2px 3px
		);
		z-index: 2;
	}

	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1.75rem;
		position: relative;
		z-index: 3;
	}

	.lock {
		font-family: 'Space Age', ui-sans-serif, sans-serif;
		font-size: clamp(2.4rem, 8vw, 4.2rem);
		letter-spacing: 0.12em;
		line-height: 0.9;
		color: #efe6d6;
	}

	.host {
		margin-left: 0.75rem;
		font-family: 'Tactic ExtExd Black', sans-serif;
		font-size: 0.85rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #e2a45a;
	}

	.slate {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #8a7d68;
	}

	.tally {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 1px;
		background: #3a1c18;
		box-shadow: inset 0 0 0 1px #5a2a22;
	}

	.tally.lit {
		background: #d23c2a;
		box-shadow: 0 0 12px #d23c2a;
		animation: pulse 1.6s ease-in-out infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.55;
		}
	}

	.mode {
		color: #efe6d6;
	}

	.hero {
		display: grid;
		gap: 1.25rem;
		margin-bottom: 2rem;
		position: relative;
		z-index: 3;
	}

	.kicker {
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: #8a7d68;
		margin: 0 0 0.2rem;
	}

	.digits {
		font-family: 'Tactic ExtExd Black', sans-serif;
		font-size: clamp(2.6rem, 10vw, 5rem);
		line-height: 0.92;
		letter-spacing: -0.03em;
		color: #efe6d6;
		margin: 0;
	}

	.digits.sm {
		font-size: clamp(1.8rem, 6vw, 2.6rem);
	}

	.unit {
		margin-left: 0.22em;
		font-size: 0.38em;
		letter-spacing: 0.08em;
		color: #c4b49a;
	}

	.sub {
		margin: 0.35rem 0 0;
		color: #8a7d68;
		font-size: 0.85rem;
	}

	.wave {
		position: relative;
		height: 4.2rem;
		border: 1px solid #3a3228;
		background: #12100e;
		overflow: hidden;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
	}

	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: linear-gradient(90deg, #6a3a12, #e2a45a);
		opacity: 0.85;
	}

	.ticks {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			90deg,
			transparent 0 9%,
			rgba(9, 8, 7, 0.55) 9% 10%
		);
	}

	.wave-lab {
		position: absolute;
		right: 0.6rem;
		bottom: 0.35rem;
		margin: 0;
		font-family: 'Tactic ExtExd Black', sans-serif;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: #efe6d6;
		z-index: 1;
	}

	.mags,
	.meters,
	.procs {
		position: relative;
		z-index: 3;
		margin-bottom: 1.75rem;
	}

	h2 {
		font-family: 'Space Age', sans-serif;
		font-size: 0.95rem;
		letter-spacing: 0.2em;
		font-weight: 400;
		margin: 0 0 0.7rem;
		color: #c4b49a;
	}

	.mags ul,
	.procs ul {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid #3a3228;
	}

	.mags li,
	.procs li {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.2rem 0.8rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid #3a3228;
		font-size: 0.9rem;
		cursor: default;
		transition:
			color 0.18s ease,
			text-shadow 0.18s ease,
			border-color 0.18s ease;
	}

	.slot {
		font-family: 'Tactic ExtExd Black', sans-serif;
		letter-spacing: 0.08em;
		font-size: 1.15rem;
	}

	.role,
	.kind {
		color: #8a7d68;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.72rem;
		align-self: center;
		text-align: right;
	}

	.state {
		letter-spacing: 0.14em;
		font-size: 0.72rem;
		color: #8a7d68;
	}

	.in .state {
		color: #d23c2a;
	}

	.in .slot {
		color: #e2a45a;
	}

	.size,
	.mib {
		text-align: right;
		font-family: 'Tactic ExtExd Black', sans-serif;
		font-size: 0.95rem;
	}

	.note {
		margin: 0.7rem 0 0;
		color: #8a7d68;
		font-size: 0.85rem;
	}

	.meters {
		display: grid;
		gap: 0.8rem;
	}

	.card {
		border: 1px solid #3a3228;
		padding: 0.9rem 1rem 1rem;
		background: #12100e;
		transition:
			border-color 0.18s ease,
			box-shadow 0.18s ease;
	}

	.bar {
		height: 0.35rem;
		background: #1b1814;
		margin: 0.65rem 0 0.4rem;
	}

	.bar i {
		display: block;
		height: 100%;
		background: #e2a45a;
	}

	.procs .nm {
		grid-column: 1;
	}

	.tail {
		position: relative;
		z-index: 3;
		border-top: 1px solid #3a3228;
		padding-top: 1rem;
		color: #8a7d68;
		font-size: 0.78rem;
		letter-spacing: 0.04em;
	}

	.tail p {
		margin: 0.2rem 0;
	}

	@media (min-width: 720px) {
		.hero {
			grid-template-columns: 1fr 1fr;
		}
		.wave {
			grid-column: 1 / -1;
		}
		.meters {
			grid-template-columns: repeat(3, 1fr);
		}
		.mags li {
			grid-template-columns: 7rem 6rem 1fr 6rem;
			align-items: baseline;
		}
		.role,
		.state {
			text-align: left;
		}
		.procs li {
			grid-template-columns: 2rem 1fr 6rem;
		}
	}

	@media (hover: hover) and (pointer: fine) {
		.readout:hover .digits {
			color: #3ef0ff;
			text-shadow: 0 0 18px #3ef0ff;
		}
		.readout.watts:hover .digits {
			color: #ff3ec8;
			text-shadow: 0 0 18px #ff3ec8;
		}
		.wave:hover {
			border-color: #3ef0ff;
			box-shadow: 0 0 22px #3ef0ff55;
		}
		.wave:hover .fill {
			background: linear-gradient(90deg, #ff3ec8, #3ef0ff);
		}
		.mags li[data-mag='sam2-tiny']:hover .slot,
		.mags li[data-mag='sam2-tiny']:hover .size {
			color: #3ef0ff;
			text-shadow: 0 0 12px #3ef0ff;
		}
		.mags li[data-mag='clip-vit-b32']:hover .slot,
		.mags li[data-mag='clip-vit-b32']:hover .size {
			color: #ff3ec8;
			text-shadow: 0 0 12px #ff3ec8;
		}
		.mags li[data-mag='flux2-klein-4b']:hover .slot,
		.mags li[data-mag='flux2-klein-4b']:hover .size {
			color: #b8ff3e;
			text-shadow: 0 0 12px #b8ff3e;
		}
		.meters .card:nth-child(1):hover {
			border-color: #3ef0ff;
			box-shadow: 0 0 18px #3ef0ff44;
		}
		.meters .card:nth-child(1):hover .digits {
			color: #3ef0ff;
			text-shadow: 0 0 14px #3ef0ff;
		}
		.meters .card:nth-child(2):hover {
			border-color: #ff3ec8;
			box-shadow: 0 0 18px #ff3ec844;
		}
		.meters .card:nth-child(2):hover .digits {
			color: #ff3ec8;
			text-shadow: 0 0 14px #ff3ec8;
		}
		.meters .card:nth-child(3):hover {
			border-color: #b8ff3e;
			box-shadow: 0 0 18px #b8ff3e44;
		}
		.meters .card:nth-child(3):hover .digits {
			color: #b8ff3e;
			text-shadow: 0 0 14px #b8ff3e;
		}
		.procs li:hover .nm,
		.procs li:hover .mib {
			color: #3ef0ff;
			text-shadow: 0 0 10px #3ef0ff;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tally.lit {
			animation: none;
		}
		.readout:hover .digits,
		.mags li:hover .slot,
		.card:hover .digits,
		.procs li:hover .nm {
			text-shadow: none;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import plate from '$lib/bay/last-plate.json';
	import { BANDWIDTH_K, FILTER_K } from '$lib/bay/t4000';
	import { filterRack, magRack, seatWord, sizeHint, type MagFilter } from '$lib/bay/rack';
	import { BayTracker } from '$lib/bay/tracker';
	import VaporGrid from '$lib/components/VaporGrid.svelte';
	import type { BayPlate, BayView } from '$lib/bay/types';

	const plateView: BayView = { ...(plate as BayPlate), feed: 'plate' };
	let view = $state<BayView>(plateView);
	let tick = $state(0);
	let armed = $state(false);
	let magFilter = $state<MagFilter>('ready');
	let openMag = $state<string | null>(null);
	let busy = $state<Record<string, 'pull' | 'eject'>>({});
	const tracker = new BayTracker();

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
		return () => {
			clearInterval(id);
			tracker.dispose();
		};
	});

	async function magPull(id: string) {
		if (!liveBrick) return;
		busy = { ...busy, [id]: 'pull' };
		try {
			await fetch(`/bay-api/mags/${id}/pull`, { method: 'POST' });
		} finally {
			const next = { ...busy };
			delete next[id];
			busy = next;
			await pull();
		}
	}

	async function magEject(id: string) {
		if (!liveBrick) return;
		if (!confirm(`Eject ${id} from disk on fractal1?`)) return;
		busy = { ...busy, [id]: 'eject' };
		try {
			const r = await fetch(`/bay-api/mags/${id}`, { method: 'DELETE' });
			if (!r.ok) {
				const j = (await r.json().catch(() => ({}))) as { error?: string };
				alert(j.error || `eject failed (${r.status})`);
			}
		} finally {
			const next = { ...busy };
			delete next[id];
			busy = next;
			await pull();
		}
	}

	async function armSound() {
		if (armed) {
			tracker.mute();
			armed = false;
			return;
		}
		await tracker.arm();
		armed = true;
	}

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
	const rack = $derived(
		magRack(view.stack, {
			vramUsedMib: view.gpu.vram_used_mib,
			procs: view.gpu.procs,
			pulling: view.pulling
		})
	);
	const shown = $derived(filterRack(rack, magFilter));
	const liveBrick = $derived(view.feed === 'live');
	const vaporSpeed = $derived(0.28 + (view.gpu.util_pct / 100) * 2.4 + (hot ? 0.7 : 0));
	const gated = $derived(rack.filter((m) => m.seat === 'gate').map((m) => m.label));

	$effect(() => {
		tracker.setLoad({
			util: view.gpu.util_pct,
			power: view.gpu.power_w,
			hot
		});
	});
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
		<VaporGrid speed={vaporSpeed} {hot} />
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
			<button type="button" class="arm" onclick={armSound} aria-pressed={armed}>
				{armed ? 'MUTE TRACKER' : 'ARM TRACKER'}
			</button>
		</div>
	</section>

	<section class="mags">
		<div class="mags-head">
			<h2>Mag rack</h2>
			<div class="filt" role="group" aria-label="Mag filter">
				<button type="button" class:on={magFilter === 'ready'} onclick={() => (magFilter = 'ready')}
					>READY</button
				>
				<button type="button" class:on={magFilter === 'all'} onclick={() => (magFilter = 'all')}
					>ALL</button
				>
			</div>
		</div>
		<ul>
			{#each shown as mag (mag.id)}
				<li
					class:in={mag.seat === 'gate'}
					class:open={openMag === mag.id}
					data-mag={mag.id}
					data-seat={mag.seat}
					title={sizeHint(mag)}
				>
					<button type="button" class="mag-hit" onclick={() => (openMag = openMag === mag.id ? null : mag.id)}>
						<span class="slot">{mag.label}</span>
						<span class="role">{mag.job}</span>
						<span class="state">{mag.pulling ? 'PULLING' : seatWord(mag.seat)}</span>
						<span class="size">{mag.sizeGb != null ? `${mag.sizeGb.toFixed(1)} GB` : '—'}</span>
					</button>
					<span class="acts">
						{#if mag.hub && mag.seat === 'empty'}
							<button
								type="button"
								class="act pull"
								disabled={!liveBrick || Boolean(busy[mag.id]) || mag.pulling}
								onclick={(e) => {
									e.stopPropagation();
									magPull(mag.id);
								}}
							>
								{busy[mag.id] === 'pull' || mag.pulling ? '…' : 'PULL'}
							</button>
						{/if}
						{#if mag.hub && mag.seat === 'cart'}
							<button
								type="button"
								class="act eject"
								disabled={!liveBrick || Boolean(busy[mag.id])}
								onclick={(e) => {
									e.stopPropagation();
									magEject(mag.id);
								}}
							>
								{busy[mag.id] === 'eject' ? '…' : 'EJECT'}
							</button>
						{/if}
					</span>
					{#if openMag === mag.id}
						<p class="drill">{sizeHint(mag)}{mag.hub ? ` · ${mag.hub}` : ''}</p>
					{/if}
				</li>
			{/each}
		</ul>
		<p class="note">
			{#if gated.length}
				In the gate: {gated.join(', ')}. Swap brick — one slottable mag at a time.
			{:else if view.gpu.procs.some((p) => p.kind === 'C')}
				Compute on the tube ({view.gpu.procs.filter((p) => p.kind === 'C').map((p) => p.name).join(', ')}), not a catalog mag.
			{:else}
				Nothing in the gate. ON CART is weights on disk. ABSENT has no 3090 cost.
			{/if}
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
		isolation: isolate;
		overflow: hidden;
		z-index: 3;
		min-height: 28rem;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto 1fr auto;
		padding: 1.15rem 1.1rem 1.15rem;
		border: 1px solid #3a3228;
		background: #09080c;
	}

	.hero :global(.vapor) {
		z-index: 0;
	}

	.readout {
		position: relative;
		z-index: 2;
		padding: 0.7rem 0.9rem 0.85rem;
		background: oklch(0.1 0.012 55 / 0.92);
		border: 1px solid oklch(0.38 0.04 70 / 0.95);
		box-shadow: 0 0 0 1px oklch(0.05 0.01 55 / 0.6);
	}

	.kicker {
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: #e6d5b8;
		margin: 0 0 0.2rem;
	}

	.digits {
		font-family: 'Tactic ExtExd Black', sans-serif;
		font-size: clamp(2.6rem, 10vw, 5rem);
		line-height: 0.92;
		letter-spacing: -0.03em;
		color: #f7f1e6;
		margin: 0;
		text-shadow: 0 1px 0 #050403;
	}

	.digits.sm {
		font-size: clamp(1.8rem, 6vw, 2.6rem);
	}

	.unit {
		margin-left: 0.22em;
		font-size: 0.38em;
		letter-spacing: 0.08em;
		color: #ead9b8;
	}

	.sub {
		margin: 0.35rem 0 0;
		color: #e0d0b4;
		font-size: 0.85rem;
	}

	.wave {
		position: relative;
		z-index: 2;
		grid-row: 4;
		height: 4.2rem;
		border: 1px solid oklch(0.38 0.04 70 / 0.95);
		background: oklch(0.1 0.012 55 / 0.38);
		overflow: hidden;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
	}

	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: #c98a3a;
		opacity: 0.92;
		z-index: 1;
	}

	.ticks {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: repeating-linear-gradient(
			90deg,
			transparent 0 9%,
			rgba(9, 8, 7, 0.45) 9% 10%
		);
		pointer-events: none;
	}

	.wave-lab {
		position: absolute;
		right: 0.6rem;
		bottom: 0.35rem;
		margin: 0;
		font-family: 'Tactic ExtExd Black', sans-serif;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: #f7f1e6;
		z-index: 2;
		text-shadow: 0 1px 0 #050403;
	}

	.arm {
		position: absolute;
		left: 0.6rem;
		bottom: 0.35rem;
		z-index: 2;
		border: 1px solid oklch(0.38 0.04 70);
		background: oklch(0.1 0.012 55 / 0.94);
		color: #ead9b8;
		font-family: 'Tactic Sans', sans-serif;
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		padding: 0.28rem 0.5rem;
		cursor: pointer;
	}

	.arm[aria-pressed='true'] {
		color: #d23c2a;
		border-color: #d23c2a;
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

	.mags-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.6rem 1rem;
		margin-bottom: 0.7rem;
	}

	.mags-head h2 {
		margin: 0;
	}

	.filt {
		display: flex;
		gap: 0.35rem;
	}

	.filt button {
		border: 1px solid #3a3228;
		background: transparent;
		color: #8a7d68;
		font-family: 'Tactic Sans', sans-serif;
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		padding: 0.25rem 0.55rem;
		cursor: pointer;
	}

	.filt button.on {
		color: #e2a45a;
		border-color: #c98a3a;
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
		grid-template-columns: 1fr auto;
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

	.mag-hit {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.2rem 0.8rem;
		width: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: inherit;
		cursor: pointer;
	}

	.acts {
		align-self: center;
	}

	.act {
		font-family: 'Tactic Sans', sans-serif;
		font-size: 0.65rem;
		letter-spacing: 0.14em;
		padding: 0.22rem 0.45rem;
		border: 1px solid;
		background: transparent;
		cursor: pointer;
	}

	.act.pull {
		color: #e2a45a;
		border-color: #c98a3a;
	}

	.act.eject {
		color: #d23c2a;
		border-color: #8a3a32;
	}

	.act:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.drill {
		grid-column: 1 / -1;
		margin: 0.15rem 0 0;
		color: #ead9b8;
		font-size: 0.8rem;
		letter-spacing: 0.02em;
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

	li[data-seat='empty'] .slot,
	li[data-seat='absent'] .slot {
		color: #6a5e50;
	}

	li[data-seat='absent'] .state {
		color: #5a4e42;
	}

	li[data-seat='cart'] .state {
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
			grid-template-rows: auto 1fr auto;
			min-height: 32rem;
		}
		.readout {
			grid-row: 1;
		}
		.wave {
			grid-column: 1 / -1;
			grid-row: 3;
		}
		.meters {
			grid-template-columns: repeat(3, 1fr);
		}
		.mags li {
			grid-template-columns: 1fr auto;
			align-items: baseline;
		}
		.mag-hit {
			grid-template-columns: 7rem 1fr 7rem 5.5rem;
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
		.mags li[data-mag='clip']:hover .slot,
		.mags li[data-mag='clip']:hover .size {
			color: #ff3ec8;
			text-shadow: 0 0 12px #ff3ec8;
		}
		.mags li[data-mag='klein-4b']:hover .slot,
		.mags li[data-mag='klein-4b']:hover .size {
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
		.arm {
			display: none;
		}
		.readout:hover .digits,
		.mags li:hover .slot,
		.card:hover .digits,
		.procs li:hover .nm {
			text-shadow: none;
		}
	}
</style>

<script lang="ts">
	import { base } from '$app/paths';
	import ChapterList from '$lib/components/ChapterList.svelte';
	import DecisionRow from '$lib/components/DecisionRow.svelte';
	import ShellViewer from '$lib/components/ShellViewer.svelte';
	import { hardwareDocs } from '$lib/content';
	import { locked } from '$lib/decisions';

	const chapters = hardwareDocs();
	const headline = locked.slice(0, 10);
</script>

<svelte:head>
	<title>AICamera — All Systems Go hardware</title>
	<meta
		name="description"
		content="Thor captures and calls shots. The 6000 generates. The NAS is the vault. This repo is the camera body."
	/>
</svelte:head>

<section class="hero shell">
	<p class="brand">All Systems Go · Studio World Tree</p>
	<h1>Thor in the body.</h1>
	<p class="lede">
		A filmmaker on a location owns a camera that thinks with them, a box that renders overnight, and
		a disk they can pick up and leave. This repository is the hardware: carrier, sensors,
		interconnect, power, enclosure, datasheets.
	</p>
	<p class="aside">
		Product vision, pipeline 0–19, modes, and models live in the spatial viewer. We cite them. We do
		not fork them.
	</p>
</section>

<section class="split shell">
	<figure>
		<ShellViewer />
	</figure>
	<div class="kit">
		<h2>Bring-up kit</h2>
		<dl>
			<div>
				<dt>Lab brick</dt>
				<dd>AGX Thor Developer Kit = T5000 module. 243 × 112 × 57 mm. QSFP28 + 5GbE.</dd>
			</div>
			<div>
				<dt>Production ceiling</dt>
				<dd>T4000 SOM, 64 GB, 1× NVENC, 70 W default / 90 W throttle, 87 × 100 × 15.29 mm.</dd>
			</div>
			<div>
				<dt>Count</dt>
				<dd>1 body + 2 satellites at 4K30. HEVC on the wire. Cooke /i sidecar next to picture.</dd>
			</div>
			<div>
				<dt>Fabric</dt>
				<dd>Body on CSI/GMSL. Sats on PoE H.265. USB-C is not the trunk.</dd>
			</div>
			<div>
				<dt>Heat</dt>
				<dd>
					70 W fanless is not honest. Body-as-radiator ~40 W. Metal production shell; resin is a
					fit-check.
				</dd>
			</div>
		</dl>
		<p class="links">
			<a href="{base}/kit/">Lab vs production</a>
			<a href="{base}/docs/references/thermal/">Thermal</a>
			<a href="{base}/docs/enclosure/">Enclosure CAD</a>
		</p>
	</div>
</section>

<section class="boxes shell">
	<h2>Three boxes</h2>
	<div class="trio">
		<div>
			<h3>Camera body</h3>
			<p>Jetson Thor. Sensors, encode, live AD, pose, overlay, snap. This repo.</p>
		</div>
		<div>
			<h3>Coprocessor</h3>
			<p>RTX PRO 6000. Reconstruct, gsplat, quality generate. Off-body, optional dual.</p>
		</div>
		<div>
			<h3>NAS</h3>
			<p>The vault. Ordinary files. Keys, takes, prompts, LUTs, scenes leave with the disks.</p>
		</div>
	</div>
</section>

<section class="ledger shell">
	<div class="head">
		<h2>Already decided</h2>
		<a href="{base}/decisions/">Full ledger, including still-open</a>
	</div>
	<p class="note">
		Do not re-litigate without new evidence. Mode switch drops AI, never record. Live overlay is a
		depth-test, not a DiT. Record path is HEVC.
	</p>
	<div>
		{#each headline as item (item.id)}
			<DecisionRow {item} />
		{/each}
	</div>
</section>

<section class="chapters shell">
	<h2>Hardware chapters</h2>
	<p class="note">Summaries first. Drill into the markdown for tables, plant diagrams, and SKUs.</p>
	<ChapterList items={chapters} />
</section>

<style>
	.hero {
		padding: 2.5rem 0 1.5rem;
	}

	.brand {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		color: var(--tungsten);
		margin: 0 0 1rem;
	}

	h1 {
		font-size: clamp(2.4rem, 7vw, 4.6rem);
		letter-spacing: -0.035em;
		line-height: 0.95;
		margin: 0 0 1.25rem;
		max-width: 14ch;
	}

	.lede {
		font-family: var(--font-serif);
		font-size: clamp(1.15rem, 2.2vw, 1.4rem);
		line-height: 1.5;
		max-width: 42rem;
		color: var(--ink);
		margin: 0 0 0.9rem;
	}

	.aside {
		max-width: 42rem;
		color: var(--ink-3);
		margin: 0;
	}

	.split {
		display: grid;
		gap: 1.5rem;
		padding: 2rem 0 1rem;
		align-items: start;
	}

	figure {
		margin: 0;
		border: 1px solid var(--line);
	}

	.kit {
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 1.25rem 1.2rem 1.1rem;
	}

	.kit h2,
	.boxes h2,
	.ledger h2,
	.chapters h2 {
		font-size: 1.45rem;
		letter-spacing: -0.03em;
		margin: 0 0 0.85rem;
	}

	dl {
		margin: 0;
		display: grid;
		gap: 0.85rem;
	}

	dt {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		color: var(--tungsten);
		margin-bottom: 0.15rem;
	}

	dd {
		margin: 0;
		color: var(--ink-2);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin: 1.1rem 0 0;
	}

	.links a,
	.head a {
		color: var(--tungsten);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.boxes,
	.ledger,
	.chapters {
		padding: 2.25rem 0 0.5rem;
	}

	.trio {
		display: grid;
		gap: 0;
		border-top: 1px solid var(--line);
	}

	.trio > div {
		padding: 1.1rem 0;
		border-bottom: 1px solid var(--line);
	}

	.trio h3 {
		margin: 0 0 0.3rem;
		font-size: 1.15rem;
		letter-spacing: -0.02em;
	}

	.trio p {
		margin: 0;
		color: var(--ink-2);
		max-width: 36ch;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.6rem;
		align-items: baseline;
	}

	.note {
		color: var(--ink-2);
		max-width: 62ch;
		margin: 0 0 1rem;
	}

	@media (min-width: 900px) {
		.hero {
			padding-top: 3.5rem;
		}
		.split {
			grid-template-columns: 1.35fr 0.85fr;
		}
		.trio {
			grid-template-columns: 1fr 1fr 1fr;
			gap: 1.5rem;
			border-bottom: 1px solid var(--line);
		}
		.trio > div {
			border-bottom: 0;
			padding-right: 1rem;
		}
	}
</style>

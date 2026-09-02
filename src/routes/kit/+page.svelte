<script lang="ts">
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Kit — AICamera</title>
	<meta
		name="description"
		content="Lab brick is the AGX Thor Developer Kit. Production ceiling is the T4000 SOM unless satellite count forces T5000."
	/>
</svelte:head>

<div class="shell page">
	<h1>Lab brick and production ceiling</h1>
	<p class="lede">
		Two envelopes. The resin shell wraps the kit we can buy today. The product is Thor inside a
		camera body, on the T4000 SOM, unless the stream budget forces the bigger module.
	</p>

	<div class="pair">
		<section>
			<h2>Lab — AGX Developer Kit</h2>
			<p>T5000 module in NVIDIA’s brick. First enclosure, first software bring-up.</p>
			<ul>
				<li>243.19 × 112.40 × 56.88 mm</li>
				<li>128 GB, 2× NVENC, 40–130 W</li>
				<li>1× 5GbE RJ45, 1× QSFP28 (4 independent 25G, not 100G aggregated)</li>
				<li>USB-C, HSB, HDMI out — no HDMI/SDI in</li>
				<li>HQ encode can do the 1+2 4K30 trio on-module</li>
			</ul>
			<p>
				<a href="{base}/docs/enclosure/">Enclosure CAD and STLs</a>
			</p>
		</section>
		<section>
			<h2>Production — T4000 SOM</h2>
			<p>DS-11945-001 v1.4. Smaller, cooler, one encoder. The default ceiling.</p>
			<ul>
				<li>87.0 × 100.0 × 15.29 mm, 0.350 kg</li>
				<li>64 GB LPDDR5X, 273 GB/s, 12× Neoverse V3AE, 1536 CUDA</li>
				<li>1× NVENC / 1× NVDEC / 1 ISP</li>
				<li>3× 25G MGBE, 75 Gbps total, independent</li>
				<li>Default 70 W, throttle 90 W, TTP max 75 °C. No CAN, no 3.3 V SV</li>
				<li>HQ encode: 2× 4Kp30. Hybrid fabric required for 1 body + 2 sats</li>
			</ul>
			<p>
				<a href="{base}/docs/references/t4000/">T4000 extract</a>
				·
				<a href="{base}/media/thor-modules-ds.pdf">Full datasheet PDF</a>
			</p>
		</section>
	</div>

	<section class="heat">
		<h2>Heat</h2>
		<p>
			TDG-12271-001 v1.3 is in the tree. The cooler is ours: it bonds to the TTP (62.5 × 81.4 mm).
			T4000 TTP max <strong>75 °C</strong>. At 70 W balanced, SoC sits 16.8 °C above TTP — so TTP
			must stay ≤ 73.2 °C to hold SoC at 90 °C.
		</p>
		<ul>
			<li>25 °C ambient, 70 W: cooler needs θpa ≤ <strong>0.69 °C/W</strong></li>
			<li>45 °C (NVIDIA air-cooled ceiling): θpa ≤ <strong>0.40 °C/W</strong></li>
			<li>
				ATS “passive” 100 W is <strong>500 LFM chassis air</strong>, not still air. Natural
				convection on that brick is ~140 °C rise at 70 W.
			</li>
			<li>Cine shell still air: ~38–50 W. Body-as-radiator is honest at ~40 W.</li>
			<li>70 W AI: heatpipes to a rear radiator + one large slow fan. Not a flock of blowers.</li>
			<li>Record-only (drop AI): 15–30 W, fanless-capable.</li>
		</ul>
		<p>
			Thor-in-body stays the product shape. Metal CAD waits on a T4000 + Rogue-T5 + ATS measurement.
			<a href="{base}/docs/references/thermal/">Thermal extract</a>
			·
			<a href="{base}/media/thor-thermal-dg.pdf">TDG PDF</a>
		</p>
	</section>

	<section class="plant">
		<h2>Plant (bring-up)</h2>
		<pre>
[body cam] --CSI/GMSL--> Thor ISP --> NVENC H.265 --> NVMe ring --> 5/10/25GbE --> NAS
[body /i ] --PL pins or barrel--> UART/USB on Thor ----------------+--> JSONL sidecar
[sat 1]    --PoE H.265--> PoE switch --\                            |
[sat 2]    --PoE H.265--> PoE switch ---+--> Thor remux / NVDEC ----+--> NAS
                                         PoE switch is a kit item (Thor has no PoE)
		</pre>
		<p>
			<a href="{base}/docs/interconnect/">Interconnect</a>
			·
			<a href="{base}/docs/stream-budget/">Stream budget</a>
			·
			<a href="{base}/docs/shopping/">Shopping brief</a>
		</p>
	</section>
</div>

<style>
	.page {
		padding: 2.25rem 0 3rem;
	}

	h1 {
		font-size: clamp(2.1rem, 5vw, 3.2rem);
		letter-spacing: -0.035em;
		margin: 0 0 0.8rem;
		max-width: 16ch;
	}

	.lede {
		font-family: var(--font-serif);
		font-size: 1.2rem;
		max-width: 42rem;
		margin: 0 0 2rem;
	}

	.pair {
		display: grid;
		gap: 1.25rem;
	}

	section {
		border: 1px solid var(--line);
		padding: 1.25rem 1.2rem 1.3rem;
		background: var(--bg);
	}

	h2 {
		font-size: 1.2rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.5rem;
	}

	p,
	li {
		color: var(--ink-2);
	}

	ul {
		margin: 0.6rem 0 1rem;
		padding-left: 1.1rem;
	}

	li {
		margin: 0.25rem 0;
	}

	a {
		color: var(--tungsten);
	}

	.heat,
	.plant {
		margin-top: 1.25rem;
	}

	pre {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		line-height: 1.55;
		overflow-x: auto;
		background: var(--bg-3);
		padding: 0.9rem;
		border: 1px solid var(--line);
		color: var(--ink);
	}

	@media (min-width: 900px) {
		.pair {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>

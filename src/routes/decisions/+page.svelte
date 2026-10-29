<script lang="ts">
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Now — AICamera</title>
	<meta
		name="description"
		content="A Thor camera that records on set, thinks on set, and hands the overnight work to an RTX PRO 6000. The current buy is the T4000 sandwich."
	/>
</svelte:head>

<div class="shell page">
	<h1>What we're building</h1>
	<p class="lede">
		A camera a filmmaker owns. It records on set and it can think on set. The heavy picture work
		happens overnight on a separate box. Closed calls stay in the repository; this page is the work
		in front of us.
	</p>

	<section>
		<h2>The camera</h2>
		<p>
			Thor sits inside the body. It captures, encodes HEVC, and runs the live work: assistant
			direction, pose, a depth-test overlay, and a snap still. Every camera writes Cooke /i lens
			data as a JSONL file beside the picture.
		</p>
		<p>
			An RTX PRO 6000, off the body, reconstructs the room and runs the quality models. The room is
			walked and captured. The NAS holds takes, pose, prompts, and scenes as ordinary files, and the
			disks leave with the owner.
		</p>
	</section>

	<section>
		<h2>This buy</h2>
		<p>
			The production body is a T4000 module on a Rogue-T5 carrier, with a cooler we design, and a
			PYXIS 6K as the cine camera on the box. That sandwich is the required cart. Satellite cameras,
			extra eyes on PoE, are optional and sit off that total.
		</p>
		<p>
			The lab brick is the AGX Thor Developer Kit, a T5000 in NVIDIA’s shell. The resin print around
			it checks fit. The product shell is metal, after the heat is measured.
		</p>
		<p class="links">
			<a href="{base}/kit/">Lab and production</a>
			<a href="{base}/docs/shopping/">The cart</a>
		</p>
	</section>

	<section>
		<h2>In front of us</h2>
		<ul>
			<li>Measure the T4000 thermal plate on a bench before drawing production metal.</li>
			<li>Choose the body 4K module. The class is CSI into Thor. The part is still open.</li>
			<li>Settle how the cameras share a clock.</li>
		</ul>
		<p class="links">
			<a href="{base}/docs/carrier/">Carrier</a>
			<a href="{base}/docs/references/thermal/">Thermal</a>
			<a href="{base}/docs/interconnect/">Interconnect</a>
		</p>
	</section>
</div>

<style>
	.page {
		padding: 2.25rem 0 3rem;
	}

	h1 {
		font-size: clamp(2.1rem, 5vw, 3.4rem);
		letter-spacing: -0.035em;
		margin: 0 0 0.8rem;
	}

	.lede {
		font-family: var(--font-serif);
		font-size: 1.2rem;
		max-width: 42rem;
		margin: 0 0 2.5rem;
		color: var(--ink);
	}

	section {
		padding: 0.25rem 0 1.75rem;
		max-width: 42rem;
	}

	h2 {
		font-size: 1.35rem;
		letter-spacing: -0.03em;
		margin: 0 0 0.6rem;
	}

	p {
		margin: 0 0 0.85rem;
		color: var(--ink-2);
	}

	ul {
		margin: 0 0 1rem;
		padding-left: 1.15rem;
		color: var(--ink-2);
	}

	li + li {
		margin-top: 0.4rem;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin: 0.2rem 0 0;
	}

	.links a {
		color: var(--tungsten);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-decoration: none;
	}
</style>

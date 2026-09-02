<script lang="ts">
	import DecisionRow from '$lib/components/DecisionRow.svelte';
	import { lab, locked, open } from '$lib/decisions';
</script>

<svelte:head>
	<title>Decisions — AICamera</title>
	<meta
		name="description"
		content="Locked calls, lab facts, and still-open questions for the All Systems Go camera body."
	/>
</svelte:head>

<div class="shell page">
	<h1>Decisions</h1>
	<p class="lede">
		The body of this camera is a pile of forks that already closed. Reopen one only with a datasheet
		or a measured encode. Open items are shopping and timing, not architecture.
	</p>

	<section>
		<h2>Locked</h2>
		<p class="note">{locked.length} calls. Do not re-litigate without new evidence.</p>
		{#each locked as item (item.id)}
			<DecisionRow {item} />
		{/each}
	</section>

	<section>
		<h2>Lab facts</h2>
		<p class="note">True of the kit we are printing and the GMSL math. Not the product envelope.</p>
		{#each lab as item (item.id)}
			<DecisionRow {item} />
		{/each}
	</section>

	<section>
		<h2>Still open</h2>
		<p class="note">{open.length} items. SKUs, time domain, and the thermal guide.</p>
		{#each open as item (item.id)}
			<DecisionRow {item} />
		{/each}
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
		padding: 0.5rem 0 1.5rem;
	}

	h2 {
		font-size: 1.35rem;
		letter-spacing: -0.03em;
		margin: 0 0 0.4rem;
	}

	.note {
		color: var(--ink-3);
		margin: 0 0 0.4rem;
	}
</style>

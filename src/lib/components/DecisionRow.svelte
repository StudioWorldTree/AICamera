<script lang="ts">
	import { base } from '$app/paths';
	import type { Decision } from '$lib/decisions';

	let { item }: { item: Decision } = $props();
</script>

<article class="row">
	<div class="status">
		<span class="pill pill-{item.status}">{item.status}</span>
	</div>
	<div class="body">
		<h3>{item.call}</h3>
		<p>{item.detail}</p>
	</div>
	{#if item.doc}
		<a class="more" href="{base}/docs/{item.doc}/">Read {item.doc}</a>
	{/if}
</article>

<style>
	.row {
		display: grid;
		gap: 0.65rem 1.25rem;
		padding: 1.1rem 0;
		border-bottom: 1px solid var(--line);
		align-items: start;
	}

	h3 {
		font-size: 1.05rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.25rem;
	}

	p {
		margin: 0;
		color: var(--ink-2);
		max-width: 62ch;
	}

	.more {
		color: var(--tungsten);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		text-decoration: none;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}

	@media (min-width: 768px) {
		.row {
			grid-template-columns: 6.5rem 1fr auto;
		}
	}
</style>

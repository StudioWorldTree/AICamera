<script lang="ts">
	import { base } from '$app/paths';
	import type { DocRecord } from '$lib/content';

	let { items }: { items: DocRecord[] } = $props();
</script>

<div class="list">
	{#each items as doc (doc.slug)}
		<a class="item" href="{base}/docs/{doc.slug}{doc.slug ? '/' : ''}">
			<span class="kicker">{doc.kicker}</span>
			<span class="title">{doc.title}</span>
			<span class="sum">{doc.summary}</span>
		</a>
	{/each}
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--line);
	}

	.item {
		display: grid;
		gap: 0.2rem 1.25rem;
		padding: 1.15rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
	}

	.kicker {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--tungsten);
		letter-spacing: 0.04em;
	}

	.title {
		font-size: 1.2rem;
		font-weight: 600;
		letter-spacing: -0.025em;
	}

	.sum {
		color: var(--ink-2);
		max-width: 68ch;
	}

	.item:hover .title {
		color: var(--tungsten);
	}

	@media (min-width: 900px) {
		.item {
			grid-template-columns: 8.5rem 14rem 1fr;
			align-items: baseline;
		}
	}
</style>

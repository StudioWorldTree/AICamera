<script lang="ts">
	import { base } from '$app/paths';
	import { docsBySlug } from '$lib/content';

	let { data } = $props();

	const doc = $derived(docsBySlug.get(data.slug)!);
	const Doc = $derived(doc.component);
</script>

<svelte:head>
	<title>{data.title} — AICamera</title>
	<meta name="description" content={data.summary} />
</svelte:head>

<div class="shell page">
	<nav class="crumb" aria-label="Breadcrumb">
		<a href="{base}/docs/">Docs</a>
		<span aria-hidden="true">/</span>
		<span>{data.kicker}</span>
	</nav>

	<div class="layout">
		<article>
			<p class="file">{data.file}</p>
			<div class="prose prose-doc">
				<Doc />
			</div>
		</article>
		{#if data.headings.length}
			<aside>
				<p class="toc-label">On this page</p>
				<ol>
					{#each data.headings as heading (heading.id + heading.text)}
						<li class="d{heading.depth}">
							<a href="#{heading.id}">{heading.text}</a>
						</li>
					{/each}
				</ol>
			</aside>
		{/if}
	</div>

	<nav class="pager" aria-label="Adjacent documents">
		{#if data.prev}
			<a href="{base}/docs/{data.prev.slug}{data.prev.slug ? '/' : ''}">
				<span>Previous</span>
				<strong>{data.prev.title}</strong>
			</a>
		{:else}
			<span></span>
		{/if}
		{#if data.next}
			<a class="next" href="{base}/docs/{data.next.slug}{data.next.slug ? '/' : ''}">
				<span>Next</span>
				<strong>{data.next.title}</strong>
			</a>
		{/if}
	</nav>
</div>

<style>
	.page {
		padding: 1.5rem 0 3rem;
	}

	.crumb {
		display: flex;
		gap: 0.45rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--ink-3);
		margin-bottom: 1.25rem;
	}

	.crumb a {
		color: var(--tungsten);
		text-decoration: none;
	}

	.layout {
		display: grid;
		gap: 2rem;
	}

	.file {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--ink-3);
		margin: 0 0 1rem;
	}

	aside {
		order: -1;
	}

	.toc-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		color: var(--ink-3);
		margin: 0 0 0.5rem;
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}

	aside a {
		color: var(--ink-2);
		text-decoration: none;
		font-size: 0.88rem;
	}

	aside a:hover {
		color: var(--tungsten);
	}

	.d3 {
		padding-left: 0.8rem;
	}

	.pager {
		display: grid;
		gap: 1rem;
		margin-top: 3rem;
		border-top: 1px solid var(--line);
		padding-top: 1.25rem;
	}

	.pager a {
		text-decoration: none;
		display: grid;
		gap: 0.15rem;
	}

	.pager span {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--ink-3);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.pager strong {
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.pager .next {
		text-align: right;
	}

	@media (min-width: 960px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 14rem;
		}
		aside {
			order: 0;
			position: sticky;
			top: 4.5rem;
			align-self: start;
		}
		.pager {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>

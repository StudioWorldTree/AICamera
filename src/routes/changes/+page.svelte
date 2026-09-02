<script lang="ts">
	import { base } from '$app/paths';
	import { groupedChanges } from '$lib/content';

	const groups = groupedChanges();
</script>

<svelte:head>
	<title>Changes — AICamera</title>
	<meta name="description" content="In-flight OpenSpec changes for the camera hardware kit." />
</svelte:head>

<div class="shell page">
	<h1>OpenSpec changes</h1>
	<p class="lede">
		Activated hardware-kit work. Each change has a proposal, often a design and an advise review, and
		a spec delta. The living spec is still empty until the first fold.
	</p>

	{#each groups as group (group.id)}
		<section>
			<h2>{group.title}</h2>
			<p>{group.summary}</p>
			<ul>
				{#each group.pages as page (page.file)}
					<li>
						<a href="{base}/docs/{page.slug}/">{page.file.replace(`openspec/changes/${group.id}/`, '')}</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
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
		margin: 0 0 2rem;
	}

	section {
		padding: 1.2rem 0;
		border-top: 1px solid var(--line);
	}

	h2 {
		font-size: 1.25rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.4rem;
	}

	p {
		color: var(--ink-2);
		max-width: 62ch;
		margin: 0 0 0.7rem;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1rem;
	}

	a {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--tungsten);
		text-decoration: none;
	}
</style>

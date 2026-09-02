<script lang="ts">
	import { base } from '$app/paths';
	import ChapterList from '$lib/components/ChapterList.svelte';
	import { docs } from '$lib/content';

	let q = $state('');

	const hardware = $derived(docs.filter((d) => d.group === 'hardware'));
	const reference = $derived(docs.filter((d) => d.group === 'reference'));
	const meta = $derived(docs.filter((d) => d.group === 'meta'));
	const changes = $derived(docs.filter((d) => d.group === 'change' || d.group === 'spec'));

	function match(list: typeof docs) {
		const needle = q.trim().toLowerCase();
		if (!needle) return list;
		return list.filter((d) =>
			`${d.title} ${d.summary} ${d.kicker} ${d.file}`.toLowerCase().includes(needle)
		);
	}
</script>

<svelte:head>
	<title>Docs — AICamera</title>
	<meta name="description" content="All markdown in the AICamera hardware repo, with summaries." />
</svelte:head>

<div class="shell page">
	<h1>Docs</h1>
	<p class="lede">
		Every <code>.md</code> in this repository, compiled by mdsvex. Hardware chapters first, then the
		Arrow extract, then in-flight OpenSpec changes.
	</p>

	<label class="find">
		<span>Filter</span>
		<input type="search" bind:value={q} placeholder="carrier, HEVC, Cooke, T4000…" />
	</label>

	<section>
		<h2>Hardware</h2>
		<ChapterList items={match(hardware)} />
	</section>

	<section>
		<h2>References</h2>
		<ChapterList items={match(reference)} />
		<p class="pdf">
			<a href="{base}/media/thor-modules-ds.pdf">Jetson Thor modules datasheet (PDF)</a>
		</p>
	</section>

	<section>
		<h2>Repo notes</h2>
		<ChapterList items={match(meta)} />
	</section>

	<section>
		<h2>OpenSpec</h2>
		<p class="note">
			In-flight changes and the living hardware-kit spec. Prefer the
			<a href="{base}/changes/">changes index</a> if you want them grouped.
		</p>
		<ChapterList items={match(changes)} />
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
		margin: 0 0 1.5rem;
	}

	.find {
		display: grid;
		gap: 0.35rem;
		max-width: 28rem;
		margin-bottom: 2rem;
	}

	.find span {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		color: var(--ink-3);
	}

	input {
		background: var(--bg-2);
		border: 1px solid var(--line);
		color: var(--ink);
		font: inherit;
		padding: 0.65rem 0.75rem;
		min-height: 44px;
	}

	section {
		padding: 0.4rem 0 1.8rem;
	}

	h2 {
		font-size: 1.3rem;
		letter-spacing: -0.03em;
		margin: 0 0 0.6rem;
	}

	.note,
	.pdf {
		color: var(--ink-2);
		margin: 0.6rem 0 0.8rem;
	}

	a {
		color: var(--tungsten);
	}

	code {
		font-family: var(--font-mono);
		font-size: 0.9em;
	}
</style>

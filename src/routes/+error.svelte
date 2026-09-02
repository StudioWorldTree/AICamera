<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
</script>

<div class="shell page">
	<p class="code">{page.status}</p>
	<h1>{page.error?.message ?? 'Missing'}</h1>
	<p><a href="{base}/">Back to the notebook</a></p>
</div>

<style>
	.page {
		padding: 4rem 0 6rem;
	}

	.code {
		font-family: var(--font-mono);
		color: var(--tally);
		margin: 0 0 0.5rem;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}

	a {
		color: var(--tungsten);
	}
</style>

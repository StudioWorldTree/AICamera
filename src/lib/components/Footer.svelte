<script lang="ts">
	import { base } from '$app/paths';
</script>

<footer>
	<div class="shell row">
		<p>
			Hardware notebook for All Systems Go. Studio World Tree.
			<a href="https://github.com/StudioWorldTree/AICamera">Source</a>
			·
			<a href="{base}/docs/">Docs</a>
			·
			<a href="{base}/media/thor-modules-ds.pdf">DS-11945-001 v1.4</a>
		</p>
		<p class="quiet">Work on main. Prefix <code>aicam</code>.</p>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line);
		margin-top: 4rem;
		padding: 1.5rem 0 2.5rem;
		background: var(--bg);
	}

	.row {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.9rem;
		color: var(--ink-2);
	}

	a {
		color: var(--tungsten);
	}

	.quiet {
		color: var(--ink-3);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	code {
		font-family: var(--font-mono);
	}
</style>

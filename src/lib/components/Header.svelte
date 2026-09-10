<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';

	let open = $state(false);

	const links = [
		{ href: '/', label: 'Overview' },
		{ href: '/kit/', label: 'Kit' },
		{ href: '/bay/', label: 'Bay' },
		{ href: '/decisions/', label: 'Decisions' },
		{ href: '/docs/', label: 'Docs' },
		{ href: '/changes/', label: 'Changes' }
	];

	function pathOf(href: string) {
		return `${base}${href === '/' ? '/' : href}`;
	}

	function active(href: string) {
		const here = page.url.pathname.replace(/\/$/, '') || '/';
		const target = pathOf(href).replace(/\/$/, '') || '/';
		if (href === '/') return here === target;
		return here === target || here.startsWith(target);
	}

	function toggleTheme() {
		const root = document.documentElement;
		const next = root.dataset.theme === 'light' ? 'dark' : 'light';
		root.dataset.theme = next;
		localStorage.setItem('aicam-theme', next);
	}
</script>

<header class="site-header">
	<div class="shell bar">
		<a class="mark" href="{base}/">
			<span class="tally" aria-hidden="true"></span>
			<span class="name">AICamera</span>
		</a>
		<nav class="desk" aria-label="Primary">
			{#each links as link (link.href)}
				<a href={pathOf(link.href)} aria-current={active(link.href) ? 'page' : undefined}
					>{link.label}</a
				>
			{/each}
		</nav>
		<div class="tools">
			<button type="button" class="ghost" onclick={toggleTheme}>Light / dark</button>
			<button
				type="button"
				class="ghost menu"
				aria-expanded={open}
				aria-controls="mobile-nav"
				onclick={() => (open = !open)}
			>
				{open ? 'Close' : 'Menu'}
			</button>
		</div>
	</div>
	{#if open}
		<nav id="mobile-nav" class="mobile" aria-label="Primary">
			{#each links as link (link.href)}
				<a
					href={pathOf(link.href)}
					aria-current={active(link.href) ? 'page' : undefined}
					onclick={() => (open = false)}>{link.label}</a
				>
			{/each}
		</nav>
	{/if}
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 40;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-height: 3.5rem;
	}

	.mark {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		text-decoration: none;
	}

	.tally {
		width: 0.55rem;
		height: 0.55rem;
		background: var(--tally);
	}

	.name {
		font-size: 1.05rem;
	}

	.desk {
		display: none;
		gap: 1.25rem;
		margin-left: 1rem;
	}

	.desk a,
	.mobile a {
		text-decoration: none;
		color: var(--ink-2);
		font-size: 0.95rem;
	}

	.desk a[aria-current='page'],
	.mobile a[aria-current='page'] {
		color: var(--ink);
		box-shadow: inset 0 -2px 0 var(--tungsten);
	}

	.tools {
		margin-left: auto;
		display: flex;
		gap: 0.4rem;
	}

	.ghost {
		background: transparent;
		border: 1px solid var(--line);
		color: var(--ink-2);
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.4rem 0.55rem;
		min-height: 44px;
		cursor: pointer;
	}

	.mobile {
		display: flex;
		flex-direction: column;
		padding: 0.5rem 1.25rem 1rem;
		border-top: 1px solid var(--line);
		background: var(--bg);
	}

	.mobile a {
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--line);
		min-height: 44px;
	}

	@media (min-width: 768px) {
		.desk {
			display: flex;
		}
		.menu,
		.mobile {
			display: none;
		}
	}
</style>

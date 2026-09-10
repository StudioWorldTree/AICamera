<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/state';

	let { children } = $props();
	const bay = $derived(page.url.pathname.includes('/bay'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Red+Hat+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<a class="skip" href="#main">Skip to content</a>
<div class:bay-lock={bay}>
	<Header />
	<main id="main" class:bay-main={bay}>
		{@render children()}
	</main>
	{#if !bay}
		<Footer />
	{/if}
</div>

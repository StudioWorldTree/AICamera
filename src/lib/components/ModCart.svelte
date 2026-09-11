<script lang="ts">
	import { CART_MIME, displayName, type StoredMod } from '$lib/bay/modlib';

	let {
		mod,
		seated = false,
		onDrag
	}: {
		mod: StoredMod;
		seated?: boolean;
		onDrag?: (id: string) => void;
	} = $props();

	const title = $derived(displayName(mod.name));
	const tone = $derived(hashTone(mod.id));

	function hashTone(id: string): 'brass' | 'pewter' | 'copper' {
		let n = 0;
		for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i) * (i + 1)) % 3;
		return n === 0 ? 'brass' : n === 1 ? 'pewter' : 'copper';
	}

	function start(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.setData(CART_MIME, mod.id);
		e.dataTransfer.effectAllowed = 'move';
		onDrag?.(mod.id);
	}
</script>

<article
	class="cart"
	class:seated
	data-tone={tone}
	draggable="true"
	ondragstart={start}
	title="{title} · {mod.ext} · {(mod.size / 1024).toFixed(0)} KB"
>
	<div class="pins" aria-hidden="true">
		{#each { length: 9 } as _, i (i)}
			<span></span>
		{/each}
	</div>
	<div class="shell">
		<span class="fmt">{mod.ext}</span>
		<span class="title">{title}</span>
	</div>
	<div class="keel" aria-hidden="true"></div>
</article>

<style>
	.cart {
		width: 4.4rem;
		height: 6.6rem;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		cursor: grab;
		user-select: none;
		filter: drop-shadow(0 6px 10px oklch(0.05 0.02 55 / 0.55));
	}

	.cart:active {
		cursor: grabbing;
	}

	.pins {
		height: 0.42rem;
		display: flex;
		gap: 0.08rem;
		padding: 0.05rem 0.12rem 0;
		background: #1a1612;
		border: 1px solid #8a7348;
		border-bottom: 0;
	}

	.pins span {
		flex: 1;
		background: #c4a574;
	}

	.shell {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 0.38rem 0.32rem 0.45rem;
		border: 1px solid #6a5a3a;
		border-top: 0;
		background:
			linear-gradient(180deg, oklch(0.22 0.02 70 / 0.5), transparent 40%),
			oklch(0.14 0.018 55);
	}

	.cart[data-tone='pewter'] .shell {
		border-color: #7a8488;
		background:
			linear-gradient(180deg, oklch(0.28 0.01 240 / 0.35), transparent 40%),
			oklch(0.16 0.01 240);
	}

	.cart[data-tone='copper'] .shell {
		border-color: #8a4e32;
		background:
			linear-gradient(180deg, oklch(0.28 0.06 50 / 0.4), transparent 40%),
			oklch(0.15 0.03 45);
	}

	.fmt {
		font-family: 'Tactic ExtExd Black', sans-serif;
		font-size: 0.55rem;
		letter-spacing: 0.16em;
		color: #c4a574;
	}

	.title {
		font-family: 'Space Age', sans-serif;
		font-size: 0.52rem;
		letter-spacing: 0.06em;
		line-height: 1.15;
		color: #f0e6d2;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}

	.keel {
		height: 0.28rem;
		background: #2a241c;
		border: 1px solid #6a5a3a;
		border-top: 0;
	}

	.seated {
		width: 3.6rem;
		height: 5.2rem;
		filter: drop-shadow(0 0 10px oklch(0.7 0.12 72 / 0.35));
	}
</style>

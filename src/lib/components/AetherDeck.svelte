<script lang="ts">
	import { CART_MIME, type StoredMod } from '$lib/bay/modlib';
	import ModCart from './ModCart.svelte';

	let {
		seated,
		hot = false,
		onSeat,
		onEject
	}: {
		seated: StoredMod | null;
		hot?: boolean;
		onSeat: (id: string) => void;
		onEject: () => void;
	} = $props();

	let over = $state(false);

	function overWell(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		over = true;
	}

	function dropWell(e: DragEvent) {
		e.preventDefault();
		over = false;
		const id = e.dataTransfer?.getData(CART_MIME);
		if (id) onSeat(id);
	}
</script>

<div
	class="deck"
	class:live={Boolean(seated)}
	class:hot
	class:over
	role="group"
	aria-label="Aether well. Drop a cartridge to play."
	ondragover={overWell}
	ondragleave={() => (over = false)}
	ondrop={dropWell}
>
	<div class="bezel">
		<p class="stamp">AETHER WELL</p>
		<div class="well">
			{#if seated}
				<ModCart mod={seated} seated />
			{:else}
				<p class="void">seat a cart</p>
			{/if}
		</div>
		<div class="plug" aria-hidden="true">
			<span class="ring"></span>
			<span class="core"></span>
		</div>
	</div>
	{#if seated}
		<button type="button" class="eject" onclick={onEject}>EJECT</button>
	{/if}
</div>

<style>
	.deck {
		position: relative;
		min-width: 11rem;
		padding: 0.7rem 0.75rem 0.8rem;
		background: oklch(0.11 0.015 55 / 0.94);
		border: 1px solid #8a7348;
		box-shadow:
			inset 0 1px 0 oklch(0.45 0.06 70 / 0.25),
			0 0 0 1px oklch(0.08 0.02 55 / 0.8);
	}

	.deck.over {
		border-color: #e2a45a;
		box-shadow: 0 0 18px oklch(0.7 0.12 72 / 0.25);
	}

	.stamp {
		margin: 0 0 0.45rem;
		font-family: 'Space Age', sans-serif;
		font-size: 0.58rem;
		letter-spacing: 0.22em;
		color: #c4a574;
	}

	.bezel {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr;
		gap: 0.45rem 0.7rem;
		align-items: center;
	}

	.stamp {
		grid-column: 1 / -1;
	}

	.well {
		min-height: 5.6rem;
		display: grid;
		place-items: center;
		border: 1px solid #3a3228;
		background:
			linear-gradient(180deg, oklch(0.08 0.01 55 / 0.95), oklch(0.12 0.02 55 / 0.6));
		box-shadow: inset 0 8px 16px oklch(0.05 0.02 55 / 0.65);
	}

	.void {
		margin: 0;
		color: #7a6e5c;
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.plug {
		width: 2.4rem;
		height: 2.4rem;
		position: relative;
		border-radius: 50%;
		border: 1px solid #8a7348;
		background: radial-gradient(circle at 40% 35%, #3a3228, #120e0c 70%);
	}

	.ring {
		position: absolute;
		inset: 0.28rem;
		border-radius: 50%;
		border: 1px solid #c4a574;
		opacity: 0.45;
	}

	.core {
		position: absolute;
		inset: 0.72rem;
		border-radius: 50%;
		background: #2a1810;
		box-shadow: inset 0 0 4px #000;
	}

	.live .core {
		background: #e2a45a;
		box-shadow: 0 0 12px #e2a45a;
	}

	.hot.live .core {
		background: #d23c2a;
		box-shadow: 0 0 14px #d23c2a;
	}

	.eject {
		margin-top: 0.55rem;
		width: 100%;
		border: 1px solid #8a3a32;
		background: transparent;
		color: #d23c2a;
		font-family: 'Tactic Sans', sans-serif;
		font-size: 0.62rem;
		letter-spacing: 0.16em;
		padding: 0.28rem 0.4rem;
		cursor: pointer;
	}
</style>

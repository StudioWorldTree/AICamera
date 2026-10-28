<script lang="ts">
	import { base } from '$app/paths';
	import { captureCents, checked, money, pieces, requiredCents, type Stance } from '$lib/cart';

	const stanceLabel: Record<Stance, string> = {
		buy: 'On the cart',
		hold: 'Price is a stand-in',
		skip: 'Do not buy'
	};
</script>

<div class="cart">
	<header class="hero">
		<p class="kicker">Buy brief · prices checked {checked}</p>
		<h1>Cart T</h1>
		<p class="lede">
			One production body computer, a cinema camera that keeps its own master, and two throwaway
			encode mules so the satellite path can be written before a custom satellite exists.
		</p>
		<div class="totals">
			<div class="total main">
				<p class="figure">{money(requiredCents)}</p>
				<p class="caption">Required, at these streets. Includes the three lines that are still placeholders.</p>
			</div>
			<div class="total">
				<p class="figure minor">{money(captureCents)}</p>
				<p class="caption">HDMI capture. Optional. Off the required total.</p>
			</div>
			<div class="total leave">
				<p class="figure minor">Open</p>
				<p class="caption">Body 4K into the ISP. A sensor on the Rogue header. Not on this order.</p>
			</div>
		</div>
	</header>

	<nav class="jump" aria-label="Parts">
		{#each pieces as piece (piece.id)}
			<a href="#{piece.id}">{piece.name}</a>
		{/each}
	</nav>

	<section class="story" id="what">
		<h2>What this buy is</h2>
		<p>
			Thor lives in the body: a T4000 on a Rogue-T5, a bench heatsink, an NVMe ring, a 12&nbsp;V
			brick, and two IX-to-RJ45 leads. The PYXIS 6K PL records Blackmagic RAW and the Cooke /i
			sidecar. Thor’s live look is the USB monitor feed. The body 4K is a sensor on the Rogue
			camera header, into the ISP, then the NVENC.
		</p>
		<p>
			The T4000’s hardware encoder does two 4Kp30 streams. A body plus two satellites is therefore
			hybrid. The satellites encode H.265. Thor remuxes. That haul is about 0.24&nbsp;Gbps, so the
			Rogue’s 10G jack is enough. The NAS is the vault. The RTX PRO 6000 stays off the camera.
		</p>
		<p>
			<a href="{base}/docs/interconnect/">Interconnect</a>
			·
			<a href="{base}/docs/stream-budget/">Stream budget</a>
			·
			<a href="{base}/docs/lens/">Lens metadata</a>
			·
			<a href="{base}/kit/">Lab brick vs this ceiling</a>
		</p>
	</section>

	<section class="fork" id="fork">
		<h2>Where the cinema camera sits</h2>
		<p class="fork-lead">
			A Blackmagic body speaks HDMI or 12G-SDI. Thor speaks CSI. Three ways to put them in the same
			room:
		</p>
		<ol class="paths">
			<li>
				<strong>Bridge the PYXIS into CSI.</strong>
				The SDI card is 1080p60, and there is no 12G card. That door is off the cart.
			</li>
			<li>
				<strong>The camera keeps the master.</strong>
				BRAW and /i stay on the PYXIS. Thor gets a picture to look at. This is the cart.
			</li>
			<li>
				<strong>Open the body.</strong>
				The sensor does not land on a Jetson connector. On a PL body the part worth stealing is the
				mount and the /i reader.
			</li>
		</ol>
	</section>

	<ol class="pieces">
		{#each pieces as piece, i (piece.id)}
			<li class="piece stance-{piece.stance}" id={piece.id}>
				<div class="piece-top">
					<p class="index">{String(i + 1).padStart(2, '0')}</p>
					<div>
						<p class="piece-kicker">{piece.kicker}</p>
						<h2>{piece.name}</h2>
					</div>
					<p class="badge">{piece.badge ?? stanceLabel[piece.stance]}</p>
				</div>

				<div class="piece-grid">
					<div class="price-col">
						<p class="figure">{piece.price}</p>
						{#if piece.ext}
							<p class="ext">{piece.ext}</p>
						{/if}
						<p class="meta">{piece.vendor}</p>
						<p class="meta mpn">{piece.mpn}</p>
						{#if piece.href}
							<p class="meta">
								<a href={piece.href}>Listing</a>
							</p>
						{/if}
					</div>
					<div class="copy">
						<p>{piece.lead}</p>
						<p class="stock">{piece.stock}</p>
						<h3>The choice</h3>
						<p>{piece.choice}</p>
					</div>
				</div>

				<ul class="options">
					{#each piece.options as option (option.name)}
						<li class:taken={option.taken} class:aside={option.aside && !option.taken}>
							<p class="mark">{option.mark ?? (option.taken ? 'This line' : 'Set aside')}</p>
							<p class="opt-price">{option.price}</p>
							<p class="opt-name">{option.name}</p>
							<p class="opt-detail">{option.detail}</p>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>

	<section class="close" id="still-open">
		<h2>Choices that still move the build</h2>
		<ul>
			<li>Name the NVMe. $146.99 is a Gen3 stand-in. A TLC Gen4 is the ring if it holds picture.</li>
			<li>Measure the passive sink. Still air on the bench means the $125 active, not a hope.</li>
			<li>Quote CBG448, the wall cable the brick does not include.</li>
			<li>
				Name an RV1126B PoE turret and a dev board before RV1126 stock disappears. A USB IMX415
				board is a different animal.
			</li>
			<li>FORECR at €999 is the escape if the Rogue slips. It is a different brick and a bigger board.</li>
			<li>A third IX lead is $82 when the 2.5G jack needs a switch.</li>
			<li>
				Ask Vision Components for a Thor device tree on the IMX585, and Connect Tech for a Thor BSP
				for one 4-lane camera on the Rogue header.
			</li>
		</ul>
		<p class="fine">
			Street prices are qty-1 USD from public listings on {checked}, except the AGX kit, the FORECR
			board, and the satellite and switch placeholders, which still carry their earlier figures.
			Arrow’s two stock counts disagree. The T4000 price does not.
		</p>
	</section>
</div>

<style>
	.cart {
		display: grid;
		gap: 1.5rem;
	}

	.kicker,
	.piece-kicker,
	.index,
	.badge,
	.meta,
	.caption,
	.ext,
	.mark {
		font-family: var(--font-mono);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.kicker {
		margin: 0 0 0.6rem;
		color: var(--tungsten);
		font-size: 0.75rem;
	}

	h1 {
		font-family: var(--font-lock);
		font-weight: 400;
		font-size: clamp(3.2rem, 10vw, 6rem);
		line-height: 0.9;
		letter-spacing: 0.04em;
		margin: 0 0 0.8rem;
	}

	h2 {
		font-size: clamp(1.45rem, 2.5vw, 1.85rem);
		letter-spacing: -0.03em;
		margin: 0;
	}

	h3 {
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-3);
		margin: 1.1rem 0 0.35rem;
	}

	.lede,
	.story p,
	.fork-lead,
	.copy p,
	.close li,
	.fine {
		font-family: var(--font-serif);
		font-size: 1.12rem;
		line-height: 1.55;
		color: var(--ink-2);
	}

	.lede {
		max-width: 40rem;
		margin: 0 0 1.5rem;
		font-size: 1.28rem;
		color: var(--ink);
	}

	.totals {
		display: grid;
		gap: 0.75rem;
	}

	.total {
		border: 1px solid var(--line);
		background: color-mix(in oklch, var(--bg-2) 88%, transparent);
		padding: 1rem 1.1rem 1.05rem;
	}

	.total.main {
		background: var(--bg-2);
		border-color: color-mix(in oklch, var(--ice) 55%, var(--line));
	}

	.total.main .figure {
		font-family: 'Tactic ExtExd Bold', var(--font-hud);
		font-weight: 700;
		color: var(--ice);
	}

	.total.leave {
		border-style: dashed;
	}

	.figure {
		font-family: var(--font-hud);
		font-weight: 900;
		line-height: 0.85;
		letter-spacing: 0.01em;
		margin: 0;
		color: var(--ink);
	}

	.total .figure {
		font-size: clamp(2.4rem, 7vw, 4.4rem);
	}

	.figure.minor,
	.price-col .figure {
		font-family: var(--font-hud-ui);
		font-weight: 400;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.figure.minor {
		font-size: clamp(1.6rem, 3vw, 2rem);
	}

	.caption,
	.meta,
	.ext,
	.stock,
	.opt-detail {
		color: var(--ink-3);
	}

	.caption {
		margin: 0.55rem 0 0;
		font-size: 0.72rem;
		max-width: 28rem;
		text-transform: none;
		letter-spacing: 0;
		font-family: var(--font-ui);
	}

	.jump {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.jump a {
		text-decoration: none;
		border: 1px solid var(--line);
		padding: 0.28rem 0.55rem;
		font-size: 0.82rem;
		color: var(--ink-2);
		background: var(--bg);
	}

	.jump a:hover {
		border-color: var(--tungsten);
		color: var(--ink);
	}

	.story,
	.fork,
	.close,
	.piece {
		border: 1px solid var(--line);
		background: color-mix(in oklch, var(--bg) 92%, transparent);
		padding: 1.2rem 1.15rem 1.3rem;
		scroll-margin-top: 4.75rem;
	}

	.story p,
	.fork-lead {
		max-width: 44rem;
		margin: 0;
	}

	.story p + p,
	.fork-lead + .paths {
		margin-top: 0.85rem;
	}

	.story a,
	.meta a {
		color: var(--tungsten);
	}

	.paths {
		margin: 0.8rem 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.7rem;
	}

	.paths li {
		padding-left: 0.9rem;
		border-left: 2px solid var(--tungsten);
		color: var(--ink-2);
		font-family: var(--font-serif);
		font-size: 1.05rem;
	}

	.paths strong {
		display: block;
		font-family: var(--font-ui);
		color: var(--ink);
		font-weight: 600;
		letter-spacing: -0.02em;
		margin-bottom: 0.15rem;
	}

	.pieces {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 1rem;
	}

	.piece-top {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75rem 0.9rem;
		align-items: start;
		margin-bottom: 1rem;
	}

	.index {
		margin: 0.15rem 0 0;
		color: var(--tungsten);
		font-size: 0.78rem;
	}

	.piece-kicker {
		margin: 0;
		font-size: 0.68rem;
		color: var(--ink-3);
	}

	.badge {
		grid-column: 1 / -1;
		justify-self: start;
		margin: 0;
		font-size: 0.68rem;
		padding: 0.15rem 0.45rem;
		border: 1px solid var(--line);
	}

	.stance-buy .badge {
		color: var(--ok);
		border-color: color-mix(in oklch, var(--ok) 50%, var(--line));
	}

	.stance-hold .badge {
		color: var(--warn);
		border-color: color-mix(in oklch, var(--warn) 50%, var(--line));
	}

	.stance-skip .badge {
		color: var(--tally);
		border-color: color-mix(in oklch, var(--tally) 50%, var(--line));
	}

	.piece-grid {
		display: grid;
		gap: 1rem;
	}

	.price-col .figure {
		font-size: clamp(2rem, 4vw, 2.8rem);
	}

	.stance-skip .price-col .figure,
	.stance-skip .opt-price {
		color: var(--tally);
	}

	.ext,
	.meta {
		margin: 0.2rem 0 0;
		font-size: 0.72rem;
	}

	.mpn {
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.8rem;
		color: var(--ink-2);
	}

	.copy p {
		margin: 0 0 0.7rem;
	}

	.stock {
		font-family: var(--font-ui);
		font-size: 0.92rem;
	}

	.options {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.55rem;
	}

	.options li {
		border: 1px solid var(--line);
		padding: 0.75rem 0.8rem 0.85rem;
		background: var(--bg-2);
	}

	.options li.taken {
		border-color: color-mix(in oklch, var(--tungsten) 60%, var(--line));
		background: color-mix(in oklch, var(--tungsten) 8%, var(--bg-2));
	}

	.mark {
		margin: 0 0 0.35rem;
		font-size: 0.65rem;
		color: var(--ink-3);
	}

	.options li.taken .mark {
		color: var(--tungsten);
	}

	.opt-price {
		font-family: var(--font-hud-ui);
		font-size: 1.45rem;
		letter-spacing: -0.03em;
		margin: 0;
		color: var(--ink);
	}

	.opt-name {
		margin: 0.25rem 0 0;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.opt-detail {
		margin: 0.2rem 0 0;
		font-size: 0.92rem;
	}

	.close ul {
		margin: 0.8rem 0 0;
		padding-left: 1.1rem;
	}

	.close li {
		margin: 0.35rem 0;
	}

	.fine {
		font-size: 0.95rem;
		margin: 1rem 0 0;
	}

	@media (min-width: 800px) {
		.totals {
			grid-template-columns: 1.5fr 1fr 1fr;
		}

		.paths,
		.options {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.piece-top {
			grid-template-columns: auto 1fr auto;
		}

		.badge {
			grid-column: auto;
			align-self: start;
		}

		.piece-grid {
			grid-template-columns: 14rem minmax(0, 1fr);
			gap: 1.5rem;
		}

		#sats .options,
		#plant .options,
		#power .options,
		#ix .options {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1100px) {
		#carrier .options {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>

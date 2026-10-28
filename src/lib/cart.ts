export type Stance = 'buy' | 'hold' | 'skip';

export type Option = {
	name: string;
	price: string;
	detail: string;
	taken?: boolean;
	aside?: boolean;
	/** Overrides the card label when “This line” would overclaim. */
	mark?: string;
	/** Store page the figure was read from, when we have one. */
	href?: string;
	source?: string;
};

export type Piece = {
	id: string;
	kicker: string;
	name: string;
	stance: Stance;
	/** Overrides the stance badge when the default wording does not fit. */
	badge?: string;
	price: string;
	ext?: string;
	vendor: string;
	mpn: string;
	/** Store named on the quote link when it is not `vendor`. */
	source?: string;
	href?: string;
	stock: string;
	lead: string;
	choice: string;
	options: Option[];
};

export const checked = '2026-10-27';

/** Required lines, cents, matching the daBOM rollup. */
export const requiredCents = 831257;
export const captureCents = 8000;

export function money(cents: number) {
	const digits = cents % 100 === 0 ? 0 : 2;
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(cents / 100);
}

export const pieces: Piece[] = [
	{
		id: 'som',
		kicker: 'Body computer',
		name: 'NVIDIA Jetson T4000',
		stance: 'buy',
		price: '$2,749',
		vendor: 'Arrow',
		mpn: '900-13834-0000-000',
		href: 'https://www.arrow.com/en/products/900-13834-0000-000/nvidia',
		stock: 'In stock. Two indexed US listings: 434 pieces on a 12-week lead, and 492 that ship tomorrow. Same unit price.',
		lead: 'Production ceiling. 64 GB, one NVENC, 70 W default and 90 W throttle, 87 × 100 × 15.29 mm. HQ encode is two 4Kp30 streams, so a body plus two satellites is a hybrid: the satellites encode, Thor remuxes.',
		choice:
			'The AGX Developer Kit is a T5000 brick for the lab, in the resin shell we already drew. It is the wrong envelope for the product. A T5000 in the body is the move only if the satellite count outgrows one encoder. Seeed’s 900-13834-0000-001 at $3,399 is a different part number.',
		options: [
			{
				name: 'T4000 SOM, qty 1',
				price: '$2,749',
				detail: 'Arrow street. 1KU list was hiked to $2,999 in July 2026.',
				taken: true,
				href: 'https://www.arrow.com/en/products/900-13834-0000-000/nvidia',
				source: 'Arrow'
			},
			{
				name: 'AGX Thor Developer Kit',
				price: '$3,499',
				detail:
					'Arrow street as of 2026-09-01, not re-fetched this pass. T5000, 128 GB, two NVENCs. Lab brick. NVIDIA’s US list is $5,499.',
				aside: true
			},
			{
				name: 'Seeed T4000 listing',
				price: '$3,399',
				detail: 'PN 900-13834-0000-001. Leave it. Wrong number for this SOM.',
				aside: true,
				href: 'https://www.seeedstudio.com/NVIDIA-Jetson-AGX-Thor-T4000-Module-p-6939.html',
				source: 'Seeed'
			}
		]
	},
	{
		id: 'carrier',
		kicker: 'Carrier',
		name: 'Connect Tech Rogue-T5',
		stance: 'buy',
		price: '$1,806',
		vendor: 'WDL Systems',
		mpn: 'AGX302',
		href: 'https://www.wdlsystems.com/connect-tech-agx302',
		stock: '6 available. Qty 1 is $1,806. The ladder runs $1,784 at 10, $1,761 at 25, $1,740 at 50.',
		lead: 'Smallest production Thor carrier that takes a T4000 or a T5000. 92 × 107 mm. Two 10GBASE-T jacks and one 2.5G, all IX Industrial. Camera I/O is an add-on header, not connectors on the board. WDL’s page title says T5000. The spec lists both modules.',
		choice:
			'Buying the carrier alone is the whole point. A WDL assembly with a T4000, stock heatspreader, and 2 TB already on it is $9,291, or $9,367 with Wi-Fi. T5000 assemblies on the same board run from about $8,200 to $12,500. FORECR DSBOARD-THRMAX is the public-price fallback if this lead time slips: €999 carrier-only, 140 × 125 mm, QSFP28, HDMI is an output, and the brick is 18–36 V. Gauntlet is the larger CTI board with RJ45, still a quote in the US. Auvidea X242 is published as T5000 until they say T4000.',
		options: [
			{
				name: 'Rogue-T5 carrier only',
				price: '$1,806',
				detail: 'WDL SKU 1CAGX302. This is the line.',
				taken: true,
				href: 'https://www.wdlsystems.com/connect-tech-agx302',
				source: 'WDL Systems'
			},
			{
				name: 'AGX302-002 with T4000',
				price: '$9,291',
				detail: 'Stock heatspreader and 2 TB, soldered. Skip.',
				aside: true,
				href: 'https://www.wdlsystems.com/connect-tech-agx302',
				source: 'WDL Systems'
			},
			{
				name: 'AGX302-005 with T4000',
				price: '$9,367',
				detail: 'Same stack plus Wi-Fi. Skip.',
				aside: true,
				href: 'https://www.wdlsystems.com/connect-tech-agx302',
				source: 'WDL Systems'
			},
			{
				name: 'FORECR THRMAX',
				price: '€999',
				detail:
					'Carrier-only public list. Bigger board, different brick, HDMI out. SOM and SSD variants were sold out. Not re-fetched 2026-10-27.',
				aside: true,
				href: 'https://www.forecr.io/products/nvidia-jetson-thor-carrier-board-dsboard-thrmax',
				source: 'FORECR'
			}
		]
	},
	{
		id: 'heat',
		kicker: 'Bench cooler',
		name: 'ATS passive heatsink',
		stance: 'buy',
		price: '$55.58',
		vendor: 'Digi-Key',
		mpn: 'ATS-NVP-3739-C1-R0',
		href: 'https://www.digikey.com/en/products/detail/advanced-thermal-solutions-inc/ATS-NVP-3739-C1-R0/28249778',
		stock: '81 in stock. Factory lead is 10 weeks. A tariff may apply. Mouser has 20 at $61.37.',
		lead: 'Orderable MPN is the -C1-R0, Digi-Key 684-ATS-NVP-3739-C1-R0-ND. The 100 W number is with airflow, about 500 LFM, not a sealed lid. Natural convection on this brick is a ~140 °C rise at 70 W.',
		choice:
			'Buy the passive for the bench and measure TTP before any metal. If that bench has no airflow, the active sibling ATS-NVA-3740-C1-R0 is $125.27 at Digi-Key and is the honest fan for a naked module. The product lid is still heatpipes to a radiator, with at most one slow fan. 70 W fanless in a cine shell is not the design.',
		options: [
			{
				name: 'Passive ATS-NVP-3739-C1-R0',
				price: '$55.58',
				detail: 'Digi-Key. Bench piece. Measure it.',
				taken: true,
				href: 'https://www.digikey.com/en/products/detail/advanced-thermal-solutions-inc/ATS-NVP-3739-C1-R0/28249778',
				source: 'Digi-Key'
			},
			{
				name: 'Same sink at Mouser',
				price: '$61.37',
				detail: '984-ATSNVP-3739C1-R0. Second source.',
				aside: true,
				href: 'https://www.mouser.com/ProductDetail/Advanced-Thermal-Solutions/ATS-NVP-3739-C1-R0',
				source: 'Mouser'
			},
			{
				name: 'Active ATS-NVA-3740-C1-R0',
				price: '$125.27',
				detail: 'Digi-Key. Use this if the bench is still air.',
				aside: true,
				href: 'https://www.digikey.com/en/products/detail/advanced-thermal-solutions-inc/ATS-NVA-3740-C1-R0/28249775',
				source: 'Digi-Key'
			}
		]
	},
	{
		id: 'power',
		kicker: '12 V brick',
		name: 'Connect Tech MSG103',
		stance: 'buy',
		price: '$316',
		vendor: 'WDL Systems',
		mpn: 'MSG103',
		href: 'https://www.wdlsystems.com/Connect-Tech-Forge-AGX-Orin-AC-DC-Power-Supply-252Watt-12Volt',
		stock: '28 available. Qty 1 is $316. Fifty-plus is $308.',
		lead: '12 V, 21 A, 252 W ±5%, 6-pin Micro-Fit. The Rogue wants 12 V. This is the brick that speaks that.',
		choice:
			'The wall cable, CBG448, is not in the box and was not priced. FORECR’s carrier wants 18–36 V, so choosing that board means a different supply, not this one. Do not feed Thor from the PoE switch.',
		options: [
			{
				name: 'MSG103',
				price: '$316',
				detail: 'WDL SKU 1CMSG103. On the cart.',
				taken: true,
				href: 'https://www.wdlsystems.com/Connect-Tech-Forge-AGX-Orin-AC-DC-Power-Supply-252Watt-12Volt',
				source: 'WDL Systems'
			},
			{
				name: 'Wall cable CBG448',
				price: 'Unpriced',
				detail: 'Not included. Still to quote.',
				aside: true
			}
		]
	},
	{
		id: 'ix',
		kicker: 'Network leads',
		name: 'IX to RJ45, 1.5 m',
		stance: 'buy',
		price: '$82',
		ext: '$164 for two',
		vendor: 'WDL Systems',
		mpn: 'CBG695',
		href: 'https://www.wdlsystems.com/connect-tech-cbg695',
		stock: '26 available.',
		lead: 'The Rogue’s Ethernet is locking IX, not RJ45. Two of these land the 10G jacks on an ordinary switch. The third jack is 2.5G and can wait.',
		choice:
			'The full Rogue cable kit, CKG073, is $784 and eight are in stock. It adds USB and DisplayPort breakouts we are not using on day one. Buy the two Ethernet leads. Add a third CBG695 later if the 2.5G port needs a home.',
		options: [
			{
				name: 'Two CBG695 leads',
				price: '$164',
				detail: '$82 each. WDL SKU 1CBG695R.',
				taken: true,
				href: 'https://www.wdlsystems.com/connect-tech-cbg695',
				source: 'WDL Systems'
			},
			{
				name: 'Full kit CKG073',
				price: '$784',
				detail: 'Three CBG695 plus USB, DisplayPort, and IO breakouts. A different buy.',
				aside: true,
				href: 'https://www.wdlsystems.com/connect-tech-ckg073',
				source: 'WDL Systems'
			}
		]
	},
	{
		id: 'nvme',
		kicker: 'Ring buffer',
		name: '1 TB NVMe',
		stance: 'hold',
		price: '$146.99',
		vendor: 'Unspecified',
		mpn: 'Not locked',
		source: 'Amazon',
		href: 'https://www.amazon.com/ADATA-Legend-PCIe-Gen4x4-2280/dp/B09YRY5MDC',
		stock: 'The $146.99 card is in stock at Amazon, sold by ADATA.',
		lead: 'The carrier has an M.2 2280 slot for the ring. The old $80 crib number is dead. No manufacturer part is chosen, so the rollup holds the low new street until we name one.',
		choice:
			'ADATA Legend 710, ALEG-710-1TCS, is a Gen3 drive at $146.99. A TLC Gen4 in the WD SN7100 class is about $175 to $200 and is the drive to buy if the ring is real picture, not a bench scratch disk. Locking that MPN is the choice still open on this line.',
		options: [
			{
				name: 'ADATA Legend 710 1 TB',
				price: '$146.99',
				detail: 'Low new street. Gen3. Placeholder, not a commitment.',
				taken: true,
				href: 'https://www.amazon.com/ADATA-Legend-PCIe-Gen4x4-2280/dp/B09YRY5MDC',
				source: 'Amazon'
			},
			{
				name: 'TLC Gen4, unnamed',
				price: '$175–$200',
				detail: 'The band to shop once the ring has a job.',
				aside: true
			}
		]
	},
	{
		id: 'pyxis',
		kicker: 'Cinema master',
		name: 'Blackmagic PYXIS 6K PL',
		stance: 'buy',
		price: '$2,475',
		vendor: 'B&H',
		mpn: 'CINECAMCPYXH60LFPL',
		href: 'https://www.bhphotovideo.com/c/product/1823586-REG/blackmagic_design_blpyxis6kpl_pyxis_6k_cinema_box.html',
		stock:
			'B&H’s catalog card says temporarily out of stock. The expected date was 16 Oct 2026, which has passed. Sweetwater lists the same $2,475. The direct B&H page was a Cloudflare interstitial, so stock is from the catalog card.',
		lead: 'The PYXIS records BRAW itself. Thor takes a monitor feed for live work. Cooke /i pins sit at 12 o’clock on the PL mount, and the mount does not swap later. SDI on this body is 4K60 monitoring. It is not a CSI input.',
		choice:
			'EF and L are $2,245. That is about $230 less, and neither mount has /i pins. The September ex-duty list for PL was $2,195. US street, duties in, settled at $2,475. The old crib number, $3,675, is the pre-cut B&H price. The Irix two-lens kit on the same B&H family is $6,355 and is not the body. A Pocket is a cheaper HDMI mule. It is not this master.',
		options: [
			{
				name: 'PYXIS 6K PL',
				price: '$2,475',
				detail: 'BH BLPYXIS6KPL. The /i body.',
				taken: true,
				href: 'https://www.bhphotovideo.com/c/product/1823586-REG/blackmagic_design_blpyxis6kpl_pyxis_6k_cinema_box.html',
				source: 'B&H'
			},
			{
				name: 'PYXIS 6K EF or L',
				price: '$2,245',
				detail: 'Electronic mount metadata. No Cooke /i pins.',
				aside: true
			},
			{
				name: 'PL plus Irix kit',
				price: '$6,355',
				detail: 'Body, two lenses, a case. Not this line.',
				aside: true
			}
		]
	},
	{
		id: 'sats',
		kicker: 'Satellites',
		name: 'Two PoE turrets and one EVB',
		stance: 'hold',
		price: '$400',
		ext: 'Two turrets and one board. Placeholders.',
		vendor: 'Unspecified',
		mpn: 'Not locked',
		stock: 'No fresh distributor card. The crib still holds the September placeholders.',
		lead: 'Two encode mules so satellite H.265 and the /i and ToF UART can be written before a custom satellite exists. One RV1126B dev board is the software seat. The turrets are not what we ship.',
		choice:
			'The mule has to be an RV1126 or RV1126B. RV1126 is being discontinued. RV1126B is the successor. A random IMX415 turret, or a USB board such as the youyeetoo at $75, is the wrong pipe. iVcan’s RV1126B-P with IMX415 was quote-only. Tronlong’s industrial kit was a limited 398 CNY promo and is not clearly this sensor. Leave the $100 and $200 placeholders until a board is named. PoE+ is enough for two turrets.',
		options: [
			{
				name: 'Two turrets',
				price: '$200',
				detail: '$100 each, placeholder. Must be RV1126 or RV1126B, PoE, IMX415-class.',
				taken: true
			},
			{
				name: 'RV1126B EVB',
				price: '$200',
				detail: 'Placeholder. UART for ToF and /i. iVcan’s older RV1126 boards were $160–$244.',
				taken: true
			}
		]
	},
	{
		id: 'plant',
		kicker: 'Plant',
		name: 'PoE+ switch and HDMI capture',
		stance: 'hold',
		price: '$200',
		ext: '$80 capture, optional',
		vendor: 'Unspecified',
		mpn: 'Not locked',
		stock: 'Placeholders from 2026-09-01. Not re-shopped.',
		lead: 'The switch powers the two turrets and nothing else. Thor has no PoE, and the switch does not power Thor. The HDMI capture is the live-AI proxy until a CSI or GMSL add-on exists.',
		choice:
			'PoE+ (802.3at) covers two turrets. A bigger switch does not change the camera. The capture card can be a $30 to $200 UVC dongle. $80 is a stand-in, and the line stays optional. It is not the take. The take is BRAW on the PYXIS.',
		options: [
			{
				name: 'PoE+ switch',
				price: '$200',
				detail: 'Placeholder. Turrets only.',
				taken: true
			},
			{
				name: 'USB HDMI capture',
				price: '$80',
				detail: 'Optional. Off until a CSI or GMSL card exists.',
				aside: true
			}
		]
	},
	{
		id: 'body4k',
		kicker: '4K into Thor',
		name: 'CSI sensor on the Rogue header',
		stance: 'hold',
		badge: 'Not on the order',
		price: 'Open',
		vendor: 'Not chosen',
		mpn: 'Not locked',
		stock: 'No line on the order. The socket is on the carrier. The module is not.',
		lead: 'The Rogue-T5 camera input is one Samtec QSH-060, sixteen MIPI CSI-2 lanes, documented in CTIM-00160. Four lanes is one 4K30 RAW camera. Those pixels land in the Thor ISP, and the NVENC makes the HEVC. That uses one of the two HQ encoders. The satellites stay on Ethernet.',
		choice:
			'The sensor to aim at is a Sony Starvis 4K module. Vision Components VC MIPI IMX585 is 3840×2160, up to 72 fps, €244.99 on the thousand-piece flyer. The public driver tree stops at Orin. VC said Thor drivers would follow project demand from the end of 2025, and the repo does not show that overlay yet. The header is not the module’s flex. Connect Tech’s Alvium mating board, JCB005, is $448.80 and out of stock, and the product page still limits it to Xavier and Orin. A March 2026 WDL note says to order it for a Rogue-T5. Those pages disagree, so it is not a buy. The open move is a yes or no from each vendor: a Thor device tree for the IMX585, and a Thor BSP for one 4-lane camera on that header.',
		options: [
			{
				name: 'VC MIPI IMX585',
				price: '€245',
				detail: 'Thousand-piece flyer, not a qty-1 street. 4K Starvis. Driver not shown for Thor.',
				taken: true,
				mark: 'Aim here'
			},
			{
				name: 'Alvium mating board',
				price: '$448.80',
				detail: 'JCB005 at WDL, out of stock. Page says Xavier and Orin. Not confirmed on Thor.',
				aside: true,
				mark: 'Wait for a BSP',
				href: 'https://www.wdlsystems.com/Connect-Tech-JCB005-Allied-Vision-MIPI-Camera-Expansion-Board-up-to-6x.-4-x-4-Lane-or-6-x-2-Lane-150',
				source: 'WDL Systems'
			},
			{
				name: 'SDI or HDMI bridge',
				price: 'Off',
				detail: '1080p60, or an unconfirmed 4K HDMI card. The monitor feed is already the USB capture.',
				aside: true,
				mark: 'Off the cart'
			}
		]
	}
];

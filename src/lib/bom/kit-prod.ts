import raw from './kit-prod.csv?raw';

/**
 * Committed explode of daBOM `kit-prod`. The static site reads this file.
 * Refresh it with `bun run bom` while the crib is running.
 * Assembly rows have blank prices. Sum `ext_for_one_usd` on buy rows only.
 */

export type BomRow = {
	path: string;
	sku: string;
	name: string;
	qtyForOne: number;
	role: string;
	optional: boolean;
	floor: string;
	manufacturer: string;
	mpn: string;
	unitCents: number | null;
	extCents: number | null;
	vendor: string;
	productUrl: string;
	priceChecked: string;
	notes: string;
};

function dollarsToCents(value: string): number | null {
	const text = value.trim();
	if (!text) return null;
	const negative = text.startsWith('-');
	const [whole, frac = ''] = text.replace(/^-/, '').split('.');
	if (!/^\d+$/.test(whole) || !/^\d{0,2}$/.test(frac)) {
		throw new Error(`kit-prod.csv has a price that is not dollars: ${value}`);
	}
	const cents = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
	return negative ? -cents : cents;
}

/** RFC 4180, enough for the crib's exporter. */
function parseCsv(source: string): Record<string, string>[] {
	const text = source
		.replace(/^\uFEFF/, '')
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n');
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (quoted) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					cell += '"';
					i++;
				} else quoted = false;
			} else cell += ch;
			continue;
		}
		if (ch === '"') quoted = true;
		else if (ch === ',') {
			row.push(cell);
			cell = '';
		} else if (ch === '\n') {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else cell += ch;
	}
	if (cell.length || row.length) {
		row.push(cell);
		rows.push(row);
	}
	const [header, ...body] = rows.filter((line) => line.some((value) => value.length > 0));
	if (!header) throw new Error('kit-prod.csv is empty');
	return body.map((line) => {
		const record: Record<string, string> = {};
		header.forEach((key, index) => {
			record[key] = line[index] ?? '';
		});
		return record;
	});
}

function toRow(record: Record<string, string>): BomRow {
	const qty = Number(record.qty_for_one);
	if (!Number.isInteger(qty) || qty < 1) {
		throw new Error(`kit-prod.csv qty_for_one is not a count on ${record.sku}`);
	}
	return {
		path: record.path,
		sku: record.sku,
		name: record.name,
		qtyForOne: qty,
		role: record.role,
		optional: record.optional === 'yes',
		floor: record.floor,
		manufacturer: record.manufacturer,
		mpn: record.mpn,
		unitCents: dollarsToCents(record.unit_price_usd),
		extCents: dollarsToCents(record.ext_for_one_usd),
		vendor: record.vendor,
		productUrl: record.product_url,
		priceChecked: record.price_checked,
		notes: record.notes
	};
}

export const bomRows: BomRow[] = parseCsv(raw).map(toRow);

const leaves = bomRows.filter((row) => row.floor !== 'assemble');

for (const row of leaves) {
	if (row.extCents == null || row.unitCents == null) {
		throw new Error(`kit-prod.csv has no price for ${row.sku}`);
	}
}

function inSat(row: BomRow) {
	return row.path.split(' / ').includes('kit-sat');
}

const requiredRows = leaves.filter((row) => !row.optional);
const satRows = leaves.filter((row) => inSat(row));
const captureRows = leaves.filter((row) => row.sku === 'hdmi-usb-capture');

const buckets = new Set([...requiredRows, ...satRows, ...captureRows].map((row) => row.path));
for (const row of leaves) {
	if (!buckets.has(row.path)) {
		throw new Error(
			`kit-prod.csv leaf ${row.sku} is outside the required, satellite, and HDMI totals`
		);
	}
}

function sum(rows: BomRow[]) {
	return rows.reduce((total, row) => total + (row.extCents ?? 0), 0);
}

function oldest(rows: BomRow[]) {
	const dates = rows.map((row) => row.priceChecked).filter((date) => date.length > 0);
	if (dates.length !== rows.length) {
		throw new Error('kit-prod.csv is missing price_checked on a totaled row');
	}
	return dates.reduce((min, date) => (date < min ? date : min));
}

export const requiredCents = sum(requiredRows);
export const satCents = sum(satRows);
export const captureCents = sum(captureRows);
/** Oldest check date on the required buy rows. Placeholder dates stay off this stamp. */
export const checked = oldest(requiredRows);
export const satChecked = oldest(satRows);

const bySku = new Map<string, BomRow>();
for (const row of leaves) {
	if (bySku.has(row.sku)) throw new Error(`kit-prod.csv lists ${row.sku} twice`);
	bySku.set(row.sku, row);
}

export function bomLine(sku: string): BomRow | undefined {
	return bySku.get(sku);
}

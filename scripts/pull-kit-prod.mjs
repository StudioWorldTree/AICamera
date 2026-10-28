#!/usr/bin/env node
/**
 * Refresh the committed Cart T export from the local daBOM crib.
 *
 *   npm run bom
 *   DABOM_API_BASE=http://[::1]:5188/api/v1 npm run bom
 *
 * Does not commit. Review the diff, then commit the CSV with the site.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'src/lib/bom/kit-prod.csv');
const header = 'level,path,sku,';

const bases = process.env.DABOM_API_BASE
	? [process.env.DABOM_API_BASE.replace(/\/$/, '')]
	: ['http://[::1]:5188/api/v1', 'http://127.0.0.1:5173/api/v1'];

async function pull(base) {
	const url = `${base}/items/kit-prod/bom.csv`;
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${response.status} ${url}`);
	let text = await response.text();
	if (!text.replace(/^\uFEFF/, '').startsWith(header)) {
		throw new Error(`${url} did not return a kit-prod CSV`);
	}
	if (!text.startsWith('\uFEFF')) text = `\uFEFF${text}`;
	return text.endsWith('\n') ? text : `${text}\n`;
}

let csv;
const failures = [];
for (const base of bases) {
	try {
		csv = await pull(base);
		console.log(`fetched ${base}/items/kit-prod/bom.csv`);
		break;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : '';
		failures.push(cause ? `${message} (${cause})` : message);
	}
}

if (!csv) {
	console.error('daBOM is not answering. Start it from the daBOM repo with `npm run dev`, or set DABOM_API_BASE.');
	for (const failure of failures) console.error(failure);
	process.exit(1);
}

let previous = '';
try {
	previous = await readFile(dest, 'utf8');
} catch {
	previous = '';
}

if (previous === csv) {
	console.log('src/lib/bom/kit-prod.csv already matches the crib');
	process.exit(0);
}

await writeFile(dest, csv);
console.log('wrote src/lib/bom/kit-prod.csv');

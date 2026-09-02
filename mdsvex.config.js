// @ts-nocheck
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '/AICamera');
const GITHUB = 'https://github.com/StudioWorldTree/AICamera/blob/main';

const MEDIA = new Map([
	['docs/cad/preview.png', `${BASE}/media/cad-preview.png`],
	[
		'docs/references/jetson_thor_series_modules_datasheet_ds-11945-001v1.4.pdf',
		`${BASE}/media/thor-modules-ds.pdf`
	],
	['docs/references/jetson_thor_thermal_dg_tdg-12271-001v1.3.pdf', `${BASE}/media/thor-thermal-dg.pdf`]
]);

/** @param {string} filePath repo-relative posix path without leading slash */
export function pathToSlug(filePath) {
	const posix = filePath.replaceAll('\\', '/');
	let rest = posix.replace(/\.md$/i, '');
	if (rest.toLowerCase().endsWith('/readme')) {
		rest = rest.slice(0, -'/readme'.length);
	}
	if (rest.toLowerCase() === 'docs') return '';
	if (rest.toLowerCase().startsWith('docs/')) rest = rest.slice('docs/'.length);
	return rest.toLowerCase();
}

function repoPathFromFile(filename) {
	if (!filename) return '';
	const abs = path.resolve(filename);
	return path.relative(ROOT, abs).replaceAll('\\', '/');
}

function resolveHref(filename, href) {
	const clean = href.split('#')[0];
	const hash = href.includes('#') ? '#' + href.split('#').slice(1).join('#') : '';
	if (!clean) return href;
	if (/^(https?:|mailto:|tel:)/i.test(clean)) return href;
	if (clean.startsWith('/')) return href;

	const from = repoPathFromFile(filename);
	const dir = path.posix.dirname(from);
	const resolved = path.posix.normalize(`${dir}/${clean}`).replace(/^\.\//, '');

	if (MEDIA.has(resolved)) return MEDIA.get(resolved) + hash;

	if (/\.md$/i.test(clean)) {
		const slug = pathToSlug(resolved);
		return `${BASE}/docs/${slug}${slug ? '/' : ''}${hash}`;
	}

	if (/\.(png|jpe?g|webp|gif|svg)$/i.test(clean)) {
		const mapped = MEDIA.get(resolved);
		if (mapped) return mapped + hash;
		return `${GITHUB}/${resolved}${hash}`;
	}

	if (/\.(pdf|stl|blend|py|json|jsonl)$/i.test(clean)) {
		const mapped = MEDIA.get(resolved);
		if (mapped) return mapped + hash;
		return `${GITHUB}/${resolved}${hash}`;
	}

	return href;
}

function remarkEscapeSvelte() {
	return (tree) => {
		visit(tree, 'text', (node, _index, parent) => {
			if (!node.value) return;
			if (parent?.type === 'code' || parent?.type === 'inlineCode') return;
			node.value = node.value
				.replaceAll('{', '&#123;')
				.replaceAll('}', '&#125;')
				.replaceAll('<', '&lt;')
				.replaceAll('>', '&gt;');
		});
	};
}

function remarkRewriteUrls() {
	return (tree, file) => {
		const filename = file.filename || file.path || file.history?.[0] || '';
		visit(tree, (node) => {
			if (node.type === 'link' || node.type === 'image') {
				if (typeof node.url === 'string' && node.url && !node.url.startsWith('#')) {
					node.url = resolveHref(filename, node.url);
				}
			}
		});
	};
}

/** @type {import('mdsvex').MdsvexOptions} */
export const mdsvexOptions = {
	extensions: ['.svx', '.md'],
	smartypants: true,
	remarkPlugins: [remarkGfm, remarkRewriteUrls, remarkEscapeSvelte],
	rehypePlugins: [rehypeSlug]
};

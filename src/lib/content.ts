import GithubSlugger from 'github-slugger';
import type { Component } from 'svelte';
import { chapterByFile, chapters, type Chapter } from './catalog';
import { pathToSlug } from './slug';

type MdModule = {
	default: Component;
	metadata?: Record<string, unknown>;
};

const compiled = import.meta.glob<MdModule>(
	['../../docs/**/*.md', '../../openspec/**/*.md', '../../AGENTS.md'],
	{ eager: true }
);

const rawFiles = import.meta.glob<string>(
	['../../docs/**/*.md', '../../openspec/**/*.md', '../../AGENTS.md'],
	{ query: '?raw', import: 'default', eager: true }
);

export type DocRecord = {
	slug: string;
	file: string;
	title: string;
	summary: string;
	group: Chapter['group'] | 'change' | 'spec';
	kicker: string;
	component: Component;
	markdown: string;
	headings: { id: string; text: string; depth: number }[];
};

function keyToFile(key: string) {
	return key.replace(/^\.\.\/\.\.\//, '').replace(/^\.\.\//, '');
}

function titleFromMarkdown(md: string, fallback: string) {
	const h1 = md.match(/^#\s+(.+)$/m);
	return h1 ? h1[1].replace(/[`*_]/g, '').trim() : fallback;
}

function summaryFromMarkdown(md: string) {
	const lines = md.split('\n');
	const paras: string[] = [];
	let buf: string[] = [];
	for (const line of lines) {
		if (line.startsWith('#')) continue;
		if (line.startsWith('>') || line.startsWith('|') || line.startsWith('```')) {
			if (buf.length) {
				paras.push(buf.join(' '));
				buf = [];
			}
			continue;
		}
		if (!line.trim()) {
			if (buf.length) {
				paras.push(buf.join(' '));
				buf = [];
			}
			continue;
		}
		buf.push(line.trim());
	}
	if (buf.length) paras.push(buf.join(' '));
	const text = paras.find((p) => p.length > 40) ?? paras[0] ?? '';
	return text
		.replace(/[*_`]/g, '')
		.replace(/^>\s*/, '')
		.replace(/\s+/g, ' ')
		.slice(0, 280);
}

function headingsFromMarkdown(md: string) {
	const out: DocRecord['headings'] = [];
	const slugger = new GithubSlugger();
	const fence = /^```/;
	let inFence = false;
	for (const line of md.split('\n')) {
		if (fence.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const m = /^(#{2,3})\s+(.+)$/.exec(line);
		if (!m) continue;
		const text = m[2].replace(/[`*_]/g, '').trim();
		out.push({ id: slugger.slug(text), text, depth: m[1].length });
	}
	return out;
}

function classify(file: string): { group: DocRecord['group']; kicker: string } {
	const chapter = chapterByFile.get(file);
	if (chapter) return { group: chapter.group, kicker: chapter.kicker };
	if (file.startsWith('openspec/changes/')) {
		const name = file.split('/')[2] ?? 'change';
		return { group: 'change', kicker: name.replace(/^add-/, '') };
	}
	if (file.startsWith('openspec/specs/')) return { group: 'spec', kicker: 'Living spec' };
	if (file.startsWith('openspec/')) return { group: 'meta', kicker: 'OpenSpec' };
	return { group: 'meta', kicker: 'Note' };
}

function buildDocs(): DocRecord[] {
	const docs: DocRecord[] = [];
	for (const [key, mod] of Object.entries(compiled)) {
		const file = keyToFile(key);
		if (!mod?.default) continue;
		const markdown = rawFiles[key] ?? '';
		const slug = pathToSlug(file);
		const chapter = chapterByFile.get(file);
		const { group, kicker } = classify(file);
		docs.push({
			slug,
			file,
			title: chapter?.title ?? titleFromMarkdown(markdown, slug || file),
			summary: chapter?.summary ?? summaryFromMarkdown(markdown),
			group,
			kicker,
			component: mod.default,
			markdown,
			headings: headingsFromMarkdown(markdown)
		});
	}
	return docs.sort((a, b) => a.file.localeCompare(b.file));
}

export const docs = buildDocs();
export const docsBySlug = new Map(docs.map((d) => [d.slug, d]));



export function hardwareDocs() {
	return chapters
		.filter((c) => c.group === 'hardware')
		.map((c) => docsBySlug.get(c.slug))
		.filter((d): d is DocRecord => Boolean(d));
}

export function referenceDocs() {
	return docs.filter((d) => d.group === 'reference');
}

export function changeDocs() {
	return docs.filter((d) => d.group === 'change');
}

export function groupedChanges() {
	const map = new Map<string, DocRecord[]>();
	for (const doc of changeDocs()) {
		const name = doc.file.split('/')[2] ?? 'change';
		const list = map.get(name) ?? [];
		list.push(doc);
		map.set(name, list);
	}
	return [...map.entries()].map(([id, pages]) => {
		const proposal = pages.find((p) => p.file.endsWith('/proposal.md'));
		return {
			id,
			title: proposal?.title ?? id,
			summary: proposal?.summary ?? pages[0]?.summary ?? '',
			pages: pages.sort((a, b) => a.file.localeCompare(b.file))
		};
	});
}

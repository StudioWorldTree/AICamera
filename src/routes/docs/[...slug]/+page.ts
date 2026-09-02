import { error } from '@sveltejs/kit';
import { docs, docsBySlug } from '$lib/content';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => {
	return docs.filter((doc) => doc.slug).map((doc) => ({ slug: doc.slug }));
};

export const load: PageLoad = ({ params }) => {
	const raw = Array.isArray(params.slug) ? params.slug.join('/') : (params.slug ?? '');
	const slug = raw.replace(/\/$/, '');
	const doc = docsBySlug.get(slug);
	if (!doc) error(404, 'That markdown file is not in the tree.');

	const index = docs.findIndex((d) => d.slug === doc.slug);
	const prev = index > 0 ? docs[index - 1] : null;
	const next = index >= 0 && index < docs.length - 1 ? docs[index + 1] : null;

	return {
		slug: doc.slug,
		title: doc.title,
		summary: doc.summary,
		file: doc.file,
		kicker: doc.kicker,
		headings: doc.headings,
		prev: prev ? { slug: prev.slug, title: prev.title } : null,
		next: next ? { slug: next.slug, title: next.title } : null
	};
};

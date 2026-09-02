/** Repo-relative path → docs URL slug (no leading slash, no trailing slash). */
export function pathToSlug(filePath: string) {
	const posix = filePath.replaceAll('\\', '/');
	let rest = posix.replace(/\.md$/i, '');
	if (rest.toLowerCase().endsWith('/readme')) {
		rest = rest.slice(0, -'/readme'.length);
	}
	if (rest.toLowerCase() === 'docs') return '';
	if (rest.toLowerCase().startsWith('docs/')) rest = rest.slice('docs/'.length);
	return rest.toLowerCase();
}

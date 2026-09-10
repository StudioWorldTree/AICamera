import { cpSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { mdsvexOptions } from './mdsvex.config.js';

const BASE: '' | `/${string}` = process.argv.includes('dev')
	? ''
	: ((process.env.BASE_PATH as `/${string}` | undefined) ?? '/AICamera');

function copyDocMedia() {
	mkdirSync('static/media', { recursive: true });
	cpSync('docs/cad/preview.png', 'static/media/cad-preview.png');
	cpSync('docs/cad/agx_shell_front.stl', 'static/media/agx_shell_front.stl');
	cpSync('docs/cad/agx_shell_rear.stl', 'static/media/agx_shell_rear.stl');
	try {
		cpSync('docs/cad/hero.glb', 'static/media/hero.glb');
	} catch {
		// Drop a GLB at docs/cad/hero.glb to replace the STL assembly in the hero.
	}
	mkdirSync('static/draco', { recursive: true });
	cpSync('node_modules/three/examples/jsm/libs/draco/gltf', 'static/draco', { recursive: true });
	cpSync(
		'docs/references/jetson_thor_series_modules_datasheet_ds-11945-001v1.4.pdf',
		'static/media/thor-modules-ds.pdf'
	);
	try {
		cpSync(
			'docs/references/jetson_thor_thermal_dg_tdg-12271-001v1.3.pdf',
			'static/media/thor-thermal-dg.pdf'
		);
	} catch {
		// Thermal guide may land in a later commit.
	}
}

copyDocMedia();

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				fallback: '404.html',
				precompress: false,
				strict: true
			}),
			paths: {
				base: BASE,
				relative: false
			},
			prerender: {
				handleMissingId: 'warn',
				handleUnseenRoutes: 'ignore'
			},
			alias: {
				$docs: 'docs',
				$openspec: 'openspec'
			},
			preprocess: [mdsvex(mdsvexOptions)],
			extensions: ['.svelte', '.svx', '.md']
		})
	],
	server: {
		fs: {
			allow: [path.resolve('.')]
		},
		proxy: {
			'/bay-api': {
				target: 'http://100.103.147.70:8745',
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/bay-api/, '')
			}
		}
	}
});

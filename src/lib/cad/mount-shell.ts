import {
	Box3,
	DoubleSide,
	EdgesGeometry,
	Group,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshBasicMaterial,
	NoToneMapping,
	Object3D,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	Vector3,
	WebGLRenderer,
	type Material,
	type Texture
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export type ShellHandle = {
	dispose: () => void;
};

export type ShellSource =
	| { glb: string; decoderPath: string; interactive?: boolean }
	| { stls: string[]; interactive?: boolean };

function disposeMaterial(mat: Material) {
	const rec = mat as Material & Record<string, Texture | undefined>;
	for (const key of Object.keys(rec)) {
		const value = rec[key];
		if (value && typeof value === 'object' && 'isTexture' in value && value.isTexture) {
			value.dispose();
		}
	}
	mat.dispose();
}

function disposeGeometries(root: Object3D) {
	root.traverse((obj) => {
		const mesh = obj as Mesh;
		if (mesh.isMesh) mesh.geometry.dispose();
		const line = obj as LineSegments;
		if (line.isLine) line.geometry.dispose();
	});
}

/** Ghost fill + feature edges. Construction-line CAD, not a shaded product shot. */
function restyleCad(root: Object3D, extras: Array<{ dispose: () => void }>) {
	const ghost = new MeshBasicMaterial({
		color: 0xe8eef6,
		transparent: true,
		opacity: 0.08,
		depthWrite: false,
		side: DoubleSide
	});
	const stroke = new LineBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0.88,
		depthWrite: false
	});
	extras.push(ghost, stroke);

	const meshes: Mesh[] = [];
	root.traverse((obj) => {
		const mesh = obj as Mesh;
		if (mesh.isMesh) meshes.push(mesh);
	});

	for (const mesh of meshes) {
		const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
		for (const mat of mats) {
			if (mat) disposeMaterial(mat);
		}
		mesh.material = ghost;
		mesh.renderOrder = 0;

		const edges = new EdgesGeometry(mesh.geometry, 18);
		const lines = new LineSegments(edges, stroke);
		lines.renderOrder = 1;
		mesh.add(lines);
	}

	return { ghost, stroke };
}

export async function mountShell(canvas: HTMLCanvasElement, source: ShellSource): Promise<ShellHandle> {
	const scene = new Scene();
	scene.background = null;

	const camera = new PerspectiveCamera(28, 1, 0.01, 100);
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: true,
		powerPreference: 'high-performance'
	});
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = NoToneMapping;

	const group = new Group();
	const extras: Array<{ dispose: () => void }> = [];
	let draco: DRACOLoader | null = null;

	if ('glb' in source) {
		draco = new DRACOLoader();
		draco.setDecoderPath(source.decoderPath.endsWith('/') ? source.decoderPath : source.decoderPath + '/');
		const loader = new GLTFLoader();
		loader.setDRACOLoader(draco);
		const gltf = await loader.loadAsync(source.glb);
		group.add(gltf.scene);
	} else {
		const loader = new STLLoader();
		const geos = await Promise.all(source.stls.map((url) => loader.loadAsync(url)));
		for (const geo of geos) {
			geo.computeVertexNormals();
			group.add(new Mesh(geo));
		}
	}

	const { ghost, stroke } = restyleCad(group, extras);
	scene.add(group);

	const box = new Box3().setFromObject(group);
	const size = box.getSize(new Vector3());
	const center = box.getCenter(new Vector3());
	group.position.sub(center);

	const span = Math.max(size.x, size.y, size.z) || 1;

	const isLight = () => {
		const theme = document.documentElement.dataset.theme;
		if (theme === 'light') return true;
		if (theme === 'dark') return false;
		return window.matchMedia('(prefers-color-scheme: light)').matches;
	};

	const applyTheme = () => {
		const light = isLight();
		ghost.color.set(light ? 0x1c222c : 0xe8eef6);
		ghost.opacity = light ? 0.07 : 0.08;
		stroke.color.set(light ? 0x1a1e26 : 0xffffff);
		stroke.opacity = light ? 0.62 : 0.88;
		requestRender();
	};

	const dist = span * 2.25;
	camera.position.set(dist * 0.62, dist * 0.28, dist * 0.78);
	camera.near = span / 200;
	camera.far = span * 30;
	camera.updateProjectionMatrix();

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = false;
	controls.enablePan = false;
	controls.enableZoom = true;
	controls.minDistance = span * 1.1;
	controls.maxDistance = span * 5;
	controls.target.set(0, 0, 0);
	controls.enabled = source.interactive !== false;
	controls.update();

	let frame = 0;
	const render = () => {
		frame = 0;
		renderer.render(scene, camera);
	};

	const requestRender = () => {
		if (frame) return;
		frame = requestAnimationFrame(render);
	};

	const resize = () => {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (width === 0 || height === 0) return;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
		render();
	};

	const ro = new ResizeObserver(resize);
	ro.observe(canvas);
	controls.addEventListener('change', requestRender);
	const themeWatch = new MutationObserver(applyTheme);
	themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	const scheme = window.matchMedia('(prefers-color-scheme: light)');
	scheme.addEventListener('change', applyTheme);
	resize();
	applyTheme();

	return {
		dispose() {
			if (frame) cancelAnimationFrame(frame);
			ro.disconnect();
			themeWatch.disconnect();
			scheme.removeEventListener('change', applyTheme);
			controls.dispose();
			disposeGeometries(group);
			extras.forEach((item) => item.dispose());
			draco?.dispose();
			renderer.dispose();
		}
	};
}

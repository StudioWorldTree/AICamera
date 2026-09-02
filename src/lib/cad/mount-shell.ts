import {
	AmbientLight,
	Box3,
	BufferGeometry,
	Color,
	DirectionalLight,
	DoubleSide,
	Group,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export type ShellHandle = {
	dispose: () => void;
};

export async function mountShell(canvas: HTMLCanvasElement, urls: string[]): Promise<ShellHandle> {
	const scene = new Scene();
	scene.background = new Color(0x1a1d24);

	const camera = new PerspectiveCamera(32, 1, 1, 2000);
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: 'low-power'
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	const lights = new Group();
	lights.add(new AmbientLight(0xc8c2b4, 0.55));
	const key = new DirectionalLight(0xffd7a0, 1.15);
	key.position.set(180, 220, 140);
	const fill = new DirectionalLight(0x8aa0c0, 0.35);
	fill.position.set(-160, 40, -80);
	lights.add(key, fill);
	scene.add(lights);

	const material = new MeshStandardMaterial({
		color: 0xb7bec6,
		metalness: 0.12,
		roughness: 0.58,
		side: DoubleSide
	});

	const loader = new STLLoader();
	const group = new Group();
	const geos = await Promise.all(urls.map((url) => loader.loadAsync(url)));
	for (const geo of geos) {
		geo.computeVertexNormals();
		group.add(new Mesh(geo, material));
	}
	scene.add(group);

	const box = new Box3().setFromObject(group);
	const size = box.getSize(new Vector3());
	const center = box.getCenter(new Vector3());
	group.position.sub(center);

	const span = Math.max(size.x, size.y, size.z);
	camera.position.set(span * 0.85, span * 0.55, span * 1.15);
	camera.near = span / 100;
	camera.far = span * 20;
	camera.updateProjectionMatrix();

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = false;
	controls.enablePan = false;
	controls.minDistance = span * 0.6;
	controls.maxDistance = span * 4;
	controls.target.set(0, 0, 0);
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
	resize();

	return {
		dispose() {
			if (frame) cancelAnimationFrame(frame);
			ro.disconnect();
			controls.dispose();
			geos.forEach((geo: BufferGeometry) => geo.dispose());
			material.dispose();
			renderer.dispose();
		}
	};
}

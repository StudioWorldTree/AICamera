import {
	ACESFilmicToneMapping,
	AmbientLight,
	Box3,
	Color,
	DirectionalLight,
	DoubleSide,
	Group,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	PMREMGenerator,
	Scene,
	SRGBColorSpace,
	Vector3,
	WebGLRenderer,
	type Material,
	type Texture
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
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

function disposeObject(root: Object3D) {
	root.traverse((obj) => {
		const mesh = obj as Mesh;
		if (!mesh.isMesh) return;
		mesh.geometry.dispose();
		const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
		for (const mat of mats) disposeMaterial(mat);
	});
}

export async function mountShell(canvas: HTMLCanvasElement, source: ShellSource): Promise<ShellHandle> {
	const scene = new Scene();
	scene.background = new Color(0x14161c);

	const camera = new PerspectiveCamera(28, 1, 0.01, 100);
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: 'high-performance'
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.15;

	const pmrem = new PMREMGenerator(renderer);
	const envScene = new RoomEnvironment();
	scene.environment = pmrem.fromScene(envScene, 0.04).texture;
	scene.environmentIntensity = 0.72;
	envScene.dispose();

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
		const material = new MeshStandardMaterial({
			color: 0xb7bec6,
			metalness: 0.12,
			roughness: 0.58,
			side: DoubleSide
		});
		extras.push(material);
		const loader = new STLLoader();
		const geos = await Promise.all(source.stls.map((url) => loader.loadAsync(url)));
		for (const geo of geos) {
			geo.computeVertexNormals();
			group.add(new Mesh(geo, material));
			extras.push(geo);
		}
	}
	scene.add(group);

	const box = new Box3().setFromObject(group);
	const size = box.getSize(new Vector3());
	const center = box.getCenter(new Vector3());
	group.position.sub(center);

	const span = Math.max(size.x, size.y, size.z) || 1;

	const lights = new Group();
	lights.add(new AmbientLight(0xc8bda8, 0.22));
	const key = new DirectionalLight(0xffe1b0, 2.1);
	key.position.set(span * 0.9, span * 1.35, span * 0.55);
	const fill = new DirectionalLight(0x8ea4c4, 0.45);
	fill.position.set(-span * 0.9, span * 0.25, span * 0.8);
	const rim = new DirectionalLight(0xb7d0ff, 1.35);
	rim.position.set(-span * 0.35, span * 0.7, -span * 1.1);
	lights.add(key, fill, rim);
	scene.add(lights);

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
	resize();

	return {
		dispose() {
			if (frame) cancelAnimationFrame(frame);
			ro.disconnect();
			controls.dispose();
			disposeObject(group);
			extras.forEach((item) => item.dispose());
			scene.environment?.dispose();
			pmrem.dispose();
			draco?.dispose();
			renderer.dispose();
		}
	};
}

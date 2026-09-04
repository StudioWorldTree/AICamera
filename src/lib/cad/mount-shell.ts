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
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export type ShellHandle = {
	dispose: () => void;
};

export type ShellSource = { glb: string } | { stls: string[] };

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
	scene.background = new Color(0x1a1d24);

	const camera = new PerspectiveCamera(32, 1, 1, 2000);
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: 'low-power'
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	const pmrem = new PMREMGenerator(renderer);
	const envScene = new RoomEnvironment();
	scene.environment = pmrem.fromScene(envScene, 0.04).texture;
	envScene.dispose();

	const lights = new Group();
	lights.add(new AmbientLight(0xc8c2b4, 0.35));
	const key = new DirectionalLight(0xffd7a0, 0.85);
	key.position.set(180, 220, 140);
	const fill = new DirectionalLight(0x8aa0c0, 0.28);
	fill.position.set(-160, 40, -80);
	lights.add(key, fill);
	scene.add(lights);

	const group = new Group();
	const extras: Array<{ dispose: () => void }> = [];

	if ('glb' in source) {
		const gltf = await new GLTFLoader().loadAsync(source.glb);
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
			disposeObject(group);
			extras.forEach((item) => item.dispose());
			scene.environment?.dispose();
			pmrem.dispose();
			renderer.dispose();
		}
	};
}

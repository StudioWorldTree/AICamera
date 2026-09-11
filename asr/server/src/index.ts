import { createApi } from './app';
import { bindIp, PORT } from './bind';
import { createRoot } from './root';
import { JsonlSidecar } from './sidecar';

const ip = bindIp();
const sidecar = new JsonlSidecar();
const app = createRoot(createApi(sidecar));

const server = Bun.serve({
	hostname: ip,
	port: PORT,
	fetch: app.fetch
});

console.log(`parakeet-asr http://${server.hostname}:${server.port}/.well-known/openapi.json`);

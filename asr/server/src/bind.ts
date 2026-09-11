/** Tailscale-only bind, same ladder as sim/3090/serve.py bind_ip(). Never a public wildcard. */

export const PORT = 8750;
export const DEFAULT_TAILSCALE_IP = '100.103.147.70';

const PUBLIC = new Set(['0.0.0.0', '*', '::', '[::]', '::0']);

export function bindIp(): string {
	const env = process.env.TAILSCALE_IP?.trim();
	if (env) return refusePublic(env);
	try {
		const out = Bun.spawnSync(['tailscale', 'ip', '-4'], {
			stdout: 'pipe',
			stderr: 'pipe'
		});
		if (out.success) {
			const ip = out.stdout.toString().trim().split(/\s+/)[0];
			if (ip) return refusePublic(ip);
		}
	} catch {
		// fall through to the fractal1 default
	}
	return DEFAULT_TAILSCALE_IP;
}

function refusePublic(ip: string): string {
	if (PUBLIC.has(ip)) {
		throw new Error(`refusing public bind ${ip}; Tailscale IPv4 only`);
	}
	return ip;
}

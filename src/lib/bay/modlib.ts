const DB = 'aicam-bay-mods';
const STORE = 'mods';
const VER = 1;

export type StoredMod = {
	id: string;
	name: string;
	ext: string;
	bytes: ArrayBuffer;
	added: number;
	size: number;
};

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB, VER);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: 'id' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

function txDone(tx: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}

export function extOf(name: string): string {
	const n = name.toLowerCase();
	if (n.startsWith('mod.')) return 'MOD';
	if (n.startsWith('xm.')) return 'XM';
	if (n.startsWith('it.')) return 'IT';
	if (n.startsWith('s3m.')) return 'S3M';
	const m = n.match(/\.([a-z0-9]+)$/);
	return (m?.[1] ?? 'MOD').toUpperCase();
}

export function displayName(name: string): string {
	return name
		.replace(/^(mod|xm|it|s3m)\./i, '')
		.replace(/\.[a-z0-9]+$/i, '')
		.replace(/[_-]+/g, ' ')
		.trim();
}

export async function listMods(): Promise<StoredMod[]> {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readonly');
		const req = tx.objectStore(STORE).getAll();
		req.onsuccess = () => {
			const rows = (req.result as StoredMod[]).sort((a, b) => b.added - a.added);
			resolve(rows);
		};
		req.onerror = () => reject(req.error);
	});
}

export async function putMod(file: File, bytes: ArrayBuffer): Promise<StoredMod> {
	const rec: StoredMod = {
		id: crypto.randomUUID(),
		name: file.name,
		ext: extOf(file.name),
		bytes,
		added: Date.now(),
		size: bytes.byteLength
	};
	const db = await openDb();
	const tx = db.transaction(STORE, 'readwrite');
	tx.objectStore(STORE).put(rec);
	await txDone(tx);
	return rec;
}

export async function getMod(id: string): Promise<StoredMod | undefined> {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readonly');
		const req = tx.objectStore(STORE).get(id);
		req.onsuccess = () => resolve(req.result as StoredMod | undefined);
		req.onerror = () => reject(req.error);
	});
}

export async function delMod(id: string): Promise<void> {
	const db = await openDb();
	const tx = db.transaction(STORE, 'readwrite');
	tx.objectStore(STORE).delete(id);
	await txDone(tx);
}

export const CART_MIME = 'application/x-aicam-mod';

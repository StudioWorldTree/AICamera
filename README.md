# AICamera

Hardware home for the All Systems Go AI camera. Thor body, HEVC record path, Cooke /i lens metadata, hybrid CSI / PoE plant.

**Notebook:** [studioworldtree.github.io/AICamera](https://studioworldtree.github.io/AICamera/)

Product ground (pipeline, modes, models, vision) lives in `web3d-space`. This repo is the camera body: carriers, sensors, interconnect, enclosures, datasheets.

## Site

SvelteKit static + [mdsvex](https://mdsvex.pngwn.io). Markdown in `docs/`, `openspec/`, and `AGENTS.md` is compiled into `/docs/…`.

```sh
npm install
npm run dev
npm run build   # BASE_PATH=/AICamera in CI
```

## Kit (locked)

- Lab brick: Jetson AGX Thor Developer Kit = T5000 module
- Production ceiling: T4000 SOM unless satellite count forces T5000
- Bring-up: 1 body + 2 satellites at 4K30
- Record: HEVC. Lens: Cooke /i JSONL sidecar

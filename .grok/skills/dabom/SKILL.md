---
name: dabom
description: Work the All Systems Go hardware crib (daBOM). Use when asked to add a kit or SKU, ingest SHOPPING.md / CAMERAS.md / a datasheet, explode a BOM, refresh a quote, look up a street price, or otherwise touch the camera bill of materials. Not this Pages notebook.
---

# daBOM from AICamera

The crib is the sister repo `../daBOM`. This notebook is product facts.

1. Read `../daBOM/AGENTS.md` (how-to-dev + agent loop).
2. If `http://localhost:5173/api/v1/health` is down, `npm run dev` in
   `../daBOM`.
3. `GET http://localhost:5173/.well-known/openapi.json` — that is the
   contract. Do not guess routes.
4. **Ingest a brief / PDF / new kit:** follow
   `../daBOM/skills/ingest-hardware/SKILL.md` (tree file, then POST
   `/api/v1/ingest`).
5. **Price / source a SKU:** follow
   `../daBOM/skills/price-quote/SKILL.md` (POST `/api/v1/quotes`).
6. **One item or BOM line:** POST the operations in the spec. Floor
   defaults `buy`; only `assemble` parents take children.

Never open `../daBOM/data/dabom/`. Never drizzle. Never invent a SKU
list from this chat when the spec and the crib already have one.

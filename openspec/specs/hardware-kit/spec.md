# hardware-kit

Living spec for the All Systems Go camera body. In-flight deltas:
`openspec/changes/*/specs/hardware-kit/`.

## Purpose

CAD and buys use envelopes and URLs from `docs/references/`, not folklore.

## Requirements

### Requirement: Datasheet manifest
Every steered SKU SHALL have a PDF or URL, fetch date, and mechanical
envelope listed under `docs/references/`.

#### Scenario: Thor SOM
- GIVEN DS-11945-001 v1.4 in `docs/references/`
- WHEN CAD or power work starts
- THEN envelopes come from [T4000.md](../../../docs/references/T4000.md), not memory

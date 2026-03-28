# Style Test Matrix

This matrix is the acceptance baseline for testing template or archetype configuration.

## How to run

```bash
npm run test:styles
```

Optional filters:

```bash
npm run test:styles -- --case=vgc-tailwind --iterations=10
```

## Default policy

- Default smoke run: `4` iterations per case
- Pre-release validation: `10-20` iterations per case
- The run fails if a case finishes below its `minPassRate`

## What every case checks

- Team size matches the selected format
- `validateTeamForTemplate()` reaches the minimum required score
- Required cores are present when the style depends on them
- Missing support packages stay within the allowed budget
- The inferred archetype matches the expected family for the template
- No forbidden pattern is triggered
- No critical set coherence issue appears
- VGC cases resolve to VGC data and not to singles data
- VGC style cases expose `recommendedModes`

## Critical set coherence failures

- `Assault Vest` with status moves
- `Choice Band` without physical attacks
- `Choice Specs` without special attacks
- `Choice` item with invalid status utility
- Hazards placed on doubles teams

## Matrix

| Case | Format | Template | Min score | Min pass rate | Extra requirements |
| --- | --- | --- | --- | --- | --- |
| `ou-balanced` | `gen9ou` | `balanced` | `0.74` | `85%` | at most 1 missing support package |
| `ou-offense` | `gen9ou` | `offense` | `0.76` | `85%` | at most 1 missing support package |
| `ou-bulkyoffense` | `gen9ou` | `bulkyoffense` | `0.65` | `75%` | accepts close `offense` and `voltturn` variants, at most 1 missing support package |
| `ou-voltturn` | `gen9ou` | `voltturn` | `0.78` | `85%` | clean core, 0 missing support packages |
| `ou-hazardstack` | `gen9ou` | `hazardstack` | `0.80` | `85%` | clean core, 0 missing support packages |
| `ou-semistall` | `gen9ou` | `semistall` | `0.76` | `80%` | clean core, at most 1 missing support package |
| `ou-stall` | `gen9ou` | `stall` | `0.80` | `85%` | clean core, at most 1 missing support package |
| `ou-rain` | `gen9ou` | `rain` | `0.82` | `90%` | clean core, at most 1 missing support package |
| `ou-sun` | `gen9ou` | `sun` | `0.79` | `75%` | clean core, at most 1 missing support package |
| `ou-sand` | `gen9ou` | `sand` | `0.79` | `75%` | clean core, at most 1 missing support package |
| `ou-weatheroffense` | `gen9ou` | `weatheroffense` | `0.80` | `75%` | clean core, accepts nearby offense outputs if the weather core is still present |
| `vgc-balanced` | `gen9vgc2026f` | `balanced` | `0.69` | `80%` | source must resolve to `gen9vgc2026regf` when available, recommended modes required |
| `vgc-trickroom` | `gen9vgc2026f` | `trickroom` | `0.82` | `90%` | clean core, source must resolve to `gen9vgc2026regf`, recommended modes required |
| `vgc-tailwind` | `gen9vgc2026f` | `tailwind` | `0.82` | `90%` | clean core, source must resolve to `gen9vgc2026regf`, recommended modes required |

## Interpreting failures

- `validation-score:*` usually means the template metadata and the builder are drifting apart.
- `missing-core:*` means the style is not actually being built.
- `missing-support:*` means the style exists but is structurally incomplete.
- `archetype:*` means the guide inference disagrees with the requested template family.
- `resolved-format:*` means the provider mapping or fallback policy is wrong.
- `set-coherence:*` means set generation quality regressed enough to invalidate style testing.

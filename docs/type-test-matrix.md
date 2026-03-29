# Type Selector Test Matrix

This matrix is the acceptance baseline for testing the Pokemon type selector.

## How to run

```bash
npm run test:types
```

Optional filters:

```bash
npm run test:types -- --case=ou-electric-no-legends --iterations=10
```

## Default policy

- Default smoke run: `3` iterations per case
- Pre-release validation: `8-12` iterations per case
- The run fails if any iteration breaks the type selector contract

## What every case checks

- Team size matches the selected format
- Every generated member includes the requested type
- `excludeLegendaries` blocks legendary and Paradox species when enabled
- No generated team contains two forms from the same species family
- Every generated member resolves to 4 non-empty moves
- The matrix covers representative selectors for OU, Monotype, Doubles OU, and VGC
- The matrix includes a sparse OU fixture where Smogon only exposes two Electric-types, so regressions like your screenshot are caught

## Matrix

| Case | Format | Template | Type | Exclude Legendaries |
| --- | --- | --- | --- | --- |
| `ou-electric-no-legends` | `gen9ou` | `balanced` | `electric` | `true` |
| `ou-electric-sparse-meta` | `gen9ou` | `balanced` | `electric` | `true` |
| `ou-dragon-no-legends` | `gen9ou` | `balanced` | `dragon` | `true` |
| `ou-grass-no-legends` | `gen9ou` | `balanced` | `grass` | `true` |
| `ou-fire-no-legends` | `gen9ou` | `balanced` | `fire` | `true` |
| `monotype-electric` | `gen9monotype` | `balanced` | `electric` | `false` |
| `monotype-dragon` | `gen9monotype` | `balanced` | `dragon` | `false` |
| `monotype-grass` | `gen9monotype` | `balanced` | `grass` | `false` |
| `monotype-fire` | `gen9monotype` | `balanced` | `fire` | `false` |
| `dou-electric-no-legends` | `gen9doublesou` | `balanced` | `electric` | `true` |
| `vgc-water-no-legends` | `gen9vgc2026f` | `balanced` | `water` | `true` |
| `ou-rotom-fixed-family-conflict` | `gen9ou` | `balanced` | n/a | `true` |
| `ou-urshifu-fixed-family-conflict` | `gen9ou` | `balanced` | n/a | `false` |

## Interpreting failures

- `team-size:*` means the selector narrowed the pool too much and the generator could not complete the team.
- `type-mismatch:*` means the selected type leaked and at least one member does not match the requested filter.
- `legendary-filter:*` means the exclusion flag was ignored for at least one generated member.
- `canonical-duplicate:*` means two forms from the same base family slipped into the same team.
- `incomplete-moves:*` means the builder returned a member with fewer than 4 usable moves.
- `exception:*` means generation crashed for that selector combination.

# v0.1 Playable Foundation Requirements

## User Goal

Players can enter a WeChat mini game, start a level, drag and rotate mirrors, and guide a light beam to the exit.

## Scope

- Home, level select, game scene, victory dialog.
- 3 to 5 playable local levels.
- Real raycast, mirror reflection, wall blocking, target hit, distance decay.
- Local progress save.
- Prism and concentrator remain placeholders.

## Out Of Scope

- Prism splitting, concentrator energy, hints, ads, login, ranking, payment, backend, sharing incentives.
- React, Vue, physics engines, large game frameworks.

## Acceptance

- `pnpm --dir minigame install` succeeds.
- `pnpm --dir minigame run typecheck` succeeds.
- `pnpm --dir minigame run debug:raycast` succeeds.
- `minigame/` can be imported by WeChat DevTools.
- At least 3 levels are playable with movable / rotatable mirrors.
- `wx` API stays inside `minigame/src/platform/`.

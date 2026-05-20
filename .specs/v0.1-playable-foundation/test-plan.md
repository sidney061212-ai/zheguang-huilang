# v0.1 Test Plan

## Command Checks

- `pnpm --dir minigame install`
- `pnpm --dir minigame run typecheck`
- `pnpm --dir minigame run build`
- `pnpm --dir minigame run debug:raycast`

## Debug Cases

`debug:raycast` must print PASS lines for:

- direct target hit
- distance exhausted
- wall block
- mirror reflection
- nearest hit selection
- remaining distance after reflection

## Manual Acceptance

- Import `minigame/` in WeChat DevTools.
- Start from Home.
- Enter level 1.
- Drag mirror body.
- Rotate mirror handle.
- Observe ray path updating.
- Hit target and show victory.
- Reset level.
- Enter next level.

## Boundary Checks

- Search `wx` usage and keep it in `src/platform/*`.
- Confirm no ads, login, payment, ranking, backend.
- Confirm prism/concentrator are placeholders and not required in v0.1 levels.
- Confirm `game.js` points to `dist/app/index.js` after build.

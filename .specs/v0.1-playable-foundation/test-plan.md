# v0.1 Test Plan

## Debug Cases

`debug:raycast` must cover:

- direct target hit
- distance lost
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

- Search `wx` usage.
- Confirm no ads, login, payment, ranking, backend.
- Confirm prism not required for v0.1.

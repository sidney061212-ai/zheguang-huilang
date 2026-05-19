# v0.1 Progress

## 2026-05-20

- Completed: created v0.1 spec files.
- Modified files: `.specs/v0.1-playable-foundation/*`.
- Test result: not run yet; spec-only commit.
- Remaining: raycast TDD, playable scenes, levels, local progress, final validation.

- Completed: added `debug:raycast` TDD cases.
- Modified files: `minigame/package.json`, `minigame/src/rules/__debug__/raycast.debug.ts`.
- Test result: cases were added before the real implementation.
- Remaining: implement real raycast, reflection, and gameplay integration.

- Completed: implemented real RaycastSystem with nearest-hit selection, mirror reflection, wall blocking, target hit, path distance decay, and max bounce guard.
- Modified files: `minigame/src/rules/RaycastSystem.ts`, `minigame/src/utils/math.ts`, `minigame/src/entities/types.ts`, `minigame/src/levels/LevelConfig.ts`.
- Test result: `pnpm --dir minigame run debug:raycast` passed 6/6.
- Remaining: integrate rendering, input, levels, and progress.

- Completed: integrated Home, LevelSelect, GameScene, mirror drag/rotate input, Canvas rendering, victory dialog, reset, next level, and local progress save.
- Modified files: `minigame/src/app/GameApp.ts`, `minigame/src/scenes/*`, `minigame/src/input/InputManager.ts`, `minigame/src/renderer/*`, `minigame/src/ui/*`, `minigame/src/platform/*`, `minigame/src/levels/*`.
- Test result: `pnpm --dir minigame run typecheck`, `pnpm --dir minigame run build`, and `pnpm --dir minigame run debug:raycast` passed locally.
- Remaining: final branch push and WeChat developer tool manual import.

- Completed: verified five default v0.1 levels are solvable through real RaycastSystem.
- Modified files: none; validation only.
- Test result: local Node check reported `hit-target` for levels 001-005.
- Remaining: manual phone/device tuning after import.

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

- Completed: Agent A/B/C/E review done and merged into fix plan (layout, scope boundary, visual refresh, WeChat chain checks).
- Modified files: `.specs/v0.1-playable-foundation/{requirements.md,design.md,tasks.md,decisions.md,test-plan.md}`.
- Notes: v0.1 boundary explicitly kept mirror-only clear path; prism/concentrator marked placeholder-only.
- Remaining: run install/typecheck/build/debug command set and record outputs.

- Completed: responsive layout helper and scene button/bounds refactor.
- Modified files: `minigame/src/utils/layout.ts`, `minigame/src/app/GameApp.ts`, `minigame/src/scenes/{GameScene.ts,HomeScene.ts,LevelSelectScene.ts}`.
- Notes: removed hardcoded drag clamp and scene button absolute coordinates, now derived from viewport layout rects.
- Remaining: run regression commands and adjust if any type/build issues.

- Completed: Canvas v0.1 visual refresh (lighter background, play area card, cleaner wall/ray/target readability).
- Modified files: `minigame/src/renderer/{CanvasRenderer.ts,RayRenderer.ts,MirrorRenderer.ts,TargetRenderer.ts,PrismRenderer.ts}`, `minigame/src/ui/{Button.ts,VictoryDialog.ts}`.
- Notes: no external images or heavy effects; kept 2D canvas lightweight.
- Remaining: verify script and build outputs.

- Completed: scope safety comments added for placeholder prism pipeline.
- Modified files: `minigame/src/entities/types.ts`, `minigame/src/rules/{RaycastSystem.ts,PrismSplitSystem.ts}`, `minigame/src/rules/__debug__/raycast.debug.ts`.
- Notes: debug now prints explicit `PASS ...` lines and guards required case count.
- Remaining: final command validation and branch push.

- Completed: command validation for merge-readiness fix round.
- Commands:
  - `pnpm --dir minigame install` -> `Already up to date`.
  - `pnpm --dir minigame run typecheck` -> pass.
  - `pnpm --dir minigame run build` -> pass.
  - `pnpm --dir minigame run debug:raycast` -> pass with six required `PASS` cases.
- Artifacts: `minigame/dist/app/index.js` confirmed exists after build.

- Completed: WeChat mini game chain verification.
- Checked files: `minigame/game.js`, `minigame/game.json`, `minigame/project.config.json`, `minigame/src/app/index.ts`, `minigame/src/app/GameApp.ts`, `minigame/src/platform/WechatPlatformAdapter.ts`.
- Import steps (WeChat DevTools):
  1. Run `pnpm --dir minigame run build`.
  2. Open WeChat DevTools and choose Mini Game project.
  3. Import folder: `/Users/sidney/Documents/game/minigame`.
  4. Confirm entry from `game.js -> dist/app/index.js`.
- Known limits:
  - Entry depends on prebuilt `dist/*` files.
  - `appid` is `touristappid` and should be replaced for release.
  - Touch pipeline currently listens to `start/move/end` only in platform adapter.

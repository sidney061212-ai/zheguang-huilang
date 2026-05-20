# Prism Lab Cocos v0.1 Tasks

## Branch & Workspace
- [x] Create branch `feature/cocos-v0.1-playtest`.
- [x] Isolate implementation from old `minigame/src`.

## Project Skeleton
- [x] Create `cocos-prism-lab/` Cocos 3.x project files (`package.json`, `project.json`, `settings`, `tsconfig`).
- [x] Add `assets/scenes/Main.scene` and meta.

## Script Migration
- [x] Copy starter scripts into `cocos-prism-lab/assets/scripts/`.
- [x] Keep optics core decoupled from Cocos runtime.

## Playable Loop
- [x] Mount `PrismLabGameController` to scene.
- [x] Implement board rendering via `Graphics`.
- [x] Implement top controls (prev/next/reset + level info).
- [x] Implement bottom toolbar (mirror/portable concentrator/prism selection and stock).
- [x] Implement place/drag/rotate interactions.
- [x] Implement victory feedback and next-level flow.

## Levels & Validator
- [x] Deliver 10 levels in `LevelPackV01`.
- [x] Ensure all levels contain `solution.objects`.
- [x] Ensure validator all-pass.

## TDD & Verification
- [x] Add tests for mirror/obstacle/concentrator/prism/level-validator.
- [x] Run `npm run test`.
- [x] Run `npm run validate:levels`.
- [x] Run `npm run typecheck`.

## Specs Trace
- [x] `requirements.md`
- [x] `design.md`
- [x] `tasks.md`
- [x] `test-plan.md`
- [x] `progress.md`
- [x] `decisions.md`

# Prism Lab Cocos v0.1 Requirements

## Goals
- Use Cocos Creator 3.x + TypeScript, with all new code in `cocos-prism-lab/`.
- Deliver a playable vertical 2D optics puzzle build with 10 levels.
- Keep optics core decoupled from Cocos node APIs for testability.
- Provide validator-backed `solution` for every level, all PASS.

## Non-Goals
- Login, ads, payment, ranking, backend, AI level generation.
- Advanced prism optics simulation (v0.1 prism stays lightweight split logic).
- WeChat mini-game publish packaging.

## Gameplay Requirements
- Logical board size is fixed at `390 x 610`.
- Top area includes: game title, level title, previous, next, reset.
- Bottom area includes: mirror / portable concentrator / prism selection and stock counts.
- Board supports:
  - place selected tool
  - drag placed mirror/concentrator/prism
  - rotate mirror via handle drag
- Win condition: any valid ray hits any valid exit.

## Level Requirements
- Exactly 10 levels in `LevelPackV01`.
- Level progression coverage:
  - L1-L2: mirrors only
  - L3: fixed concentrator introduced
  - L4-L5: portable concentrator introduced
  - L6-L7: multi-obstacle multi-reflection
  - L8: prism lightweight split introduced
  - L9-L10: combined scenarios
- Every level must include:
  - `source`, `exits`, `tools`, `objects`, `solution.objects`

## Acceptance Criteria
- AC-01: Cocos project skeleton exists under `cocos-prism-lab/`.
- AC-02: `assets/scenes/Main.scene` exists and includes Canvas/GameRoot/Board/UILayer/TopBar/Toolbar/VictoryPanel.
- AC-03: `PrismLabGameController` is mounted in scene and drives runtime.
- AC-04: 10 levels all pass validator.
- AC-05: automated tests for optics core pass.
- AC-06: `typecheck` script passes.
- AC-07: `.specs/cocos-v0.1-playtest/` has requirements/design/tasks/test-plan/progress/decisions.
- AC-08: Old `minigame/src` is untouched by this delivery.

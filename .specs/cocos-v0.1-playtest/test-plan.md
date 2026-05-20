# Prism Lab Cocos v0.1 Test Plan

## Automated Checks
Run in `cocos-prism-lab/`:
1. `npm install`
2. `npm run test`
3. `npm run validate:levels`
4. `npm run typecheck`

Pass criteria:
- All commands exit 0.
- `validateAllLevels` prints PASS for levels 01-10.

## Automated Coverage Scope
- Mirror reflection route correctness.
- Obstacle blocking behavior.
- Concentrator distance extension behavior.
- Prism split and color-accepted exit behavior.
- Whole-pack validator pass status.

## Manual Playtest Checklist
- Open project in Cocos Creator 3.x.
- Open `assets/scenes/Main.scene`.
- Preview scene and verify:
  - top controls visible and clickable
  - bottom toolbar visible with 3 tool types
  - place tool on board works
  - drag and rotate mirror works
  - rays redraw in real time
  - win panel appears and can enter next level

## Level Regression Checklist
- L01 [ ]
- L02 [ ]
- L03 [ ]
- L04 [ ]
- L05 [ ]
- L06 [ ]
- L07 [ ]
- L08 [ ]
- L09 [ ]
- L10 [ ]

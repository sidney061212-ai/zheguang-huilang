# Prism Lab Cocos v0.1 Design

## Runtime Architecture
- Scene: `assets/scenes/Main.scene`
- Main controller: `assets/scripts/gameplay/PrismLabGameController.ts`
- Rendering/input view: `assets/scripts/views/BoardView.ts`
- Toolbar logic: `assets/scripts/views/ToolbarView.ts`
- Win panel logic: `assets/scripts/ui/VictoryPanel.ts`

## Core/Engine Separation
- Pure optics core (no Cocos imports):
  - `core/math/Vec2Math.ts`
  - `core/optics/types.ts`
  - `core/optics/Geometry.ts`
  - `core/optics/LightSimulator.ts`
- Cocos layer only converts touch + node state to core input/output.

## Simulation Model
- Queue-based ray traversal with event cap.
- Collision priority: nearest hit among exits/mirrors/obstacles/concentrators/prisms.
- Mirror: reflection with geometric normal.
- Concentrator: distance boost once per source ray path.
- Prism (v0.1): split into -15/0/+15 deg rays with RGB color tags.

## Interaction Model
- Tool selection from toolbar.
- Touch empty board to place selected tool if stock remains.
- Touch placed object to select and drag.
- For mirror: dragging handle enters rotate mode.
- Re-simulate and redraw after every interaction.

## Layout Strategy
- Board physics coordinates stay fixed at `390x610`.
- Actual viewport adaptation scales board node uniformly.
- Top and bottom controls are outside board and do not alter board coordinates.

## Level Validation
- `LevelSolutionValidator.validateAllLevels()` loops all levels.
- `validateSolution(level).success === true` is mandatory for each level.

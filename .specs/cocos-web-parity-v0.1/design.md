# Cocos Web Parity v0.1 Design

## Runtime Structure
- `Main.scene`: `Canvas -> GameRoot`。
- `GameRoot` 挂载 `PrismGameController`。
- `PrismGameController` 代码创建：
  - `BoardRoot` + `CanvasBoardRenderer` + `Graphics`
  - `UIRoot` + `RuntimeUI`（HUD/按钮/工具栏/旋转按钮/胜利面板）

## Coordinate Mapping
物理计算始终使用逻辑坐标（左上原点，y 向下）：
- `logicToLocal(p)`: `x = p.x - 390/2`, `y = 610/2 - p.y`
- `localToLogic(p)`: `x = p.x + 390/2`, `y = 610/2 - p.y`

## Gameplay State
- `level = cloneLevel(LevelPackWebParity[levelIndex])`
- `sim = simulateLight(level)`
- 工具库存直接在 `level.tools` 上递减，放置对象直接 push 到 `level.objects`。

## Rendering
`CanvasBoardRenderer` 用 Graphics 绘制：
- 背景与棋盘
- 光源与出口
- 障碍、镜子、聚光器、三棱镜
- 光线路径（多段）
- 选中态与旋转手柄

# Cocos Web Parity v0.1 Test Plan

## Automated
- `npm run typecheck`（目录：`cocos-web-parity/`）
- 检查 `Main.scene` 存在且包含 `Canvas`、`GameRoot`、`PrismGameController`
- 核心算法一致性：`simulateLight` 使用真实几何求交与反射/分光流程

## Manual (Creator Preview)
- 打开 `Main.scene`，确认非空白
- 第 1 关：
  - 选择反射镜并放置
  - 拖动镜子
  - 旋转镜子（手柄或按钮）
  - 观察光路实时变化
  - 命中出口弹出胜利层
- 验证重置、上一关、下一关
- 验证前 6 关可进入

## Notes
- 本轮聚焦可玩链路，不做 UI 精修。

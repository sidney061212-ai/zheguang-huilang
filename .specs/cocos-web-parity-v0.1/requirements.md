# Cocos Web Parity v0.1 Requirements

## Goal
把 Web 版《Prism Lab / 折光回廊》以 1:1 玩法迁移到 Cocos Creator 3.x，优先“能玩”。

## Must Keep Parity
- 逻辑坐标与尺寸：`LOGICAL_WIDTH=390`, `LOGICAL_HEIGHT=610`。
- 核心数学函数与光学规则沿用 Web 逻辑。
- `simulateLight()` 作为唯一胜负依据。
- 关卡先迁移 Web 版 6 关，不强行扩到 10 关。
- 交互流程保持：选工具 -> 放置 -> 选中 -> 拖动/旋转 -> 实时重算。

## Must Deliver
- Cocos 工程目录：`cocos-web-parity/`。
- `Main.scene` 可打开，预览非空白。
- 第 1 关可通过放置镜子+移动/旋转通关。
- 支持上一关/下一关/重置。
- 胜利弹层在命中出口时出现。

## Explicitly Deferred
- 广告、登录、排行榜、后端。
- 复杂三棱镜物理增强（保留 Web 版三束分光规则）。
- 复杂美术、动效、皮肤系统。

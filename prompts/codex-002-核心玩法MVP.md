# Codex 任务 002：核心玩法 MVP

请在 `minigame/` 中实现 3 关可玩的核心玩法 MVP。

目标：
- 光源发射光线。
- 镜子按真实镜面反射改变光线方向。
- 三棱镜让白光只分裂一次，生成 red / green / blue 三条彩色光。
- 目标点命中后触发胜利。
- 胜利后可以进入下一关。

范围：
- 只修改 `minigame/src/rules/`、`minigame/src/scenes/GameScene.ts`、`minigame/src/renderer/`、`minigame/src/levels/` 以及必要实体类型。
- 不接登录、排行榜、广告、支付、后端。
- wx API 仍只允许出现在 `platform` 层。

验收：
- 前 3 关可以在微信开发者工具中游玩。
- Debug 模式可以输出光线段数和 prism 分裂次数。
- 没有 9 条光线 bug。
- `npm` 或项目约定构建命令通过。

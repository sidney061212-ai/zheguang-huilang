# Codex 任务 001：正式立项与工程骨架

你是本项目执行开发工程师。请在当前仓库中正式立项微信小游戏项目《棱镜光线 / Prism Lab》。

目标：
- 创建 `docs/`、`prompts/`、`minigame/` 项目结构。
- 保留旧 demo，不删除历史原型；如需移动，归档到 `archive/demo/`。
- 编写正式项目文档、README 和微信小游戏工程骨架。
- 使用 TypeScript、Canvas 2D、自研轻量框架，不使用 Unity、Cocos、Phaser。
- 第一版不接登录、排行榜、广告、支付、后端和隐私采集。

验收：
- `docs/` 中包含立项、PRD、玩法、架构、UI、音效、关卡、性能、上线、审核、协作说明。
- `minigame/src/` 按 app/core/scenes/entities/rules/renderer/input/ui/audio/levels/platform/utils 分层。
- `PrismSplitSystem` 明确避免 1 条白光分裂后变成 9 条。
- 提交 commit：`chore: initialize Prism Lab minigame project`。

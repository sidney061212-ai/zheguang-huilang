# Prism Lab 微信小游戏工程

## 微信小游戏运行说明

本目录是《棱镜光线 / Prism Lab》的微信小游戏工程。第一版使用 TypeScript 和 Canvas 2D，自研轻量框架，不使用 Unity、Cocos、Phaser。

## 微信开发者工具导入方式

1. 打开微信开发者工具。
2. 选择导入项目。
3. 项目目录选择本仓库的 `minigame/`。
4. AppID 使用正式 AppID；尚未申请时可使用测试号进行本地调试。
5. 项目类型选择小游戏。

## TypeScript 构建说明

当前提交为工程骨架，源码位于 `minigame/src/`。后续可接入轻量构建脚本，把 TypeScript 编译到微信小游戏可运行的入口文件。构建过程不得引入重型引擎依赖。

## 当前骨架状态

- 已创建 app/core/scenes/entities/rules/renderer/input/ui/audio/levels/platform/utils 分层。
- 已定义核心实体类型和三棱镜分光规则占位。
- 已创建微信小游戏基础配置文件 `game.json` 和 `project.config.json`。

## 后续开发入口

下一步从 `prompts/codex-002-核心玩法MVP.md` 开始，实现 3 关可玩 MVP。重点先完成光线传播、镜子反射、三棱镜分光和目标命中。

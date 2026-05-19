# Codex 任务 003：三棱镜分光修复

请专门检查并修复三棱镜 9 条光线 bug。

目标：
- 1 条 white ray 第一次进入 1 个 prism，只能生成 3 条彩色 ray。
- 分裂出的 red / green / blue ray 不能再次被同一个 prism 分裂。
- 同一条 ray 对同一个 prismId 只能触发一次 split。
- 多 prism 场景不得无限递归或重复分裂。

实现建议：
- 在 Ray 上保留 `hasSplit`、`splitHistory`、`sourceId`。
- 在 `PrismSplitSystem` 中集中判断，不把分光规则散落到渲染或场景。
- 增加 Debug 日志或最小测试用例。

验收：
- 添加测试或调试用例验证 1 -> 3，不会 3 -> 9。
- 说明 bug 根因和修复逻辑。
- 不影响镜子反射、目标命中和 UI。

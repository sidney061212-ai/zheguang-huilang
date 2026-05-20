# Cocos Web Parity v0.1 Decisions

1. 选择新目录 `cocos-web-parity/`，避免历史 `cocos-prism-lab` 接线污染。
2. 用代码创建 UI，减少编辑器拖拽绑定导致的 missing reference 风险。
3. 保留 Web 版光学内核，不改胜利判定，不做假通关。
4. 三棱镜先按 Web 逻辑三束分光（-15/0/+15），后续再升级真实折射模型。
5. 提供旋转保底按钮（逆时针/顺时针 5°），确保触摸旋转不稳定时仍可通关。

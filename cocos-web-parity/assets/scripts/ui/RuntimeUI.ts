import { _decorator, Color, Component, Input, Label, Node, UITransform } from 'cc';
import type { ToolKind, ToolStock } from '../core/LevelTypes';

const { ccclass } = _decorator;

export type RuntimeUIBindings = {
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSelectTool: (tool: ToolKind) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onVictoryNext: () => void;
  onVictoryReset: () => void;
};

const TOOL_ORDER: ToolKind[] = ['mirror', 'portableConcentrator', 'prism'];
const TOOL_NAME: Record<ToolKind, string> = {
  mirror: '反射镜',
  portableConcentrator: '便携聚光器',
  prism: '三棱镜',
};

@ccclass('RuntimeUI')
export class RuntimeUI extends Component {
  private bindings: RuntimeUIBindings | null = null;
  private built = false;

  private levelLabel: Label | null = null;
  private progressLabel: Label | null = null;
  private statusLabel: Label | null = null;
  private toolbarStatusLabel: Label | null = null;

  private toolLabels: Record<ToolKind, Label | null> = {
    mirror: null,
    portableConcentrator: null,
    prism: null,
  };

  private rotateLeftNode: Node | null = null;
  private rotateRightNode: Node | null = null;

  private victoryPanel: Node | null = null;
  private victoryMessageLabel: Label | null = null;

  public build(logicalWidth: number, logicalHeight: number, bindings: RuntimeUIBindings) {
    this.bindings = bindings;
    if (this.built) {
      return;
    }

    this.built = true;
    const rootTransform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    rootTransform.setContentSize(logicalWidth + 60, logicalHeight + 260);

    const topBar = this.ensureNode(this.node, 'TopBar', 0, logicalHeight / 2 + 82, logicalWidth + 30, 150);
    this.ensureLabel(topBar, 'GameTitle', 'Prism Lab / 折光回廊', 0, 44, 24, new Color(235, 243, 255, 255));
    this.levelLabel = this.ensureLabel(topBar, 'LevelTitle', '', 0, 14, 20, new Color(184, 208, 255, 255));
    this.progressLabel = this.ensureLabel(topBar, 'ProgressText', '', 0, -12, 16, new Color(136, 176, 244, 255));
    this.statusLabel = this.ensureLabel(topBar, 'StatusText', '', 0, -35, 16, new Color(160, 192, 240, 255));

    this.ensureButton(topBar, 'PrevButton', '上一关', -logicalWidth * 0.34, -62, 90, 34, new Color(190, 216, 255, 255), () => {
      this.bindings?.onPrev();
    });
    this.ensureButton(topBar, 'ResetButton', '重置', 0, -62, 90, 34, new Color(190, 216, 255, 255), () => {
      this.bindings?.onReset();
    });
    this.ensureButton(topBar, 'NextButton', '下一关', logicalWidth * 0.34, -62, 90, 34, new Color(190, 216, 255, 255), () => {
      this.bindings?.onNext();
    });

    const toolbar = this.ensureNode(this.node, 'ToolBar', 0, -logicalHeight / 2 - 86, logicalWidth, 132);
    const spacing = logicalWidth / 3;
    for (let i = 0; i < TOOL_ORDER.length; i += 1) {
      const kind = TOOL_ORDER[i];
      const btnNode = this.ensureButton(
        toolbar,
        `Tool-${kind}`,
        TOOL_NAME[kind],
        -logicalWidth / 2 + spacing * (i + 0.5),
        24,
        120,
        40,
        new Color(220, 232, 255, 255),
        () => {
          this.bindings?.onSelectTool(kind);
        },
      );
      this.toolLabels[kind] = btnNode.getComponent(Label);
    }

    this.toolbarStatusLabel = this.ensureLabel(toolbar, 'ToolStatus', '点击道具后再点棋盘放置', 0, -32, 16, new Color(141, 205, 255, 255));

    const rotateBar = this.ensureNode(this.node, 'RotateBar', 0, -logicalHeight / 2 - 36, logicalWidth, 52);
    this.rotateLeftNode = this.ensureButton(
      rotateBar,
      'RotateLeft',
      '逆时针 5°',
      -78,
      0,
      120,
      34,
      new Color(214, 232, 255, 255),
      () => {
        this.bindings?.onRotateLeft();
      },
    );
    this.rotateRightNode = this.ensureButton(
      rotateBar,
      'RotateRight',
      '顺时针 5°',
      78,
      0,
      120,
      34,
      new Color(214, 232, 255, 255),
      () => {
        this.bindings?.onRotateRight();
      },
    );

    this.victoryPanel = this.ensureNode(this.node, 'VictoryPanel', 0, 0, logicalWidth, 220);
    this.victoryMessageLabel = this.ensureLabel(
      this.victoryPanel,
      'VictoryText',
      '通关成功',
      0,
      34,
      28,
      new Color(238, 245, 255, 255),
    );
    this.ensureButton(this.victoryPanel, 'VictoryReset', '重置', -66, -52, 90, 34, new Color(194, 202, 219, 255), () => {
      this.bindings?.onVictoryReset();
    });
    this.ensureButton(this.victoryPanel, 'VictoryNext', '下一关', 66, -52, 110, 34, new Color(120, 214, 132, 255), () => {
      this.bindings?.onVictoryNext();
    });

    this.hideVictory();
  }

  public setHeader(levelText: string, progressText: string, statusText: string) {
    if (this.levelLabel) {
      this.levelLabel.string = levelText;
    }
    if (this.progressLabel) {
      this.progressLabel.string = progressText;
    }
    if (this.statusLabel) {
      this.statusLabel.string = statusText;
    }
  }

  public setToolState(stock: ToolStock, selectedTool: ToolKind | null) {
    for (const kind of TOOL_ORDER) {
      const remaining = Math.max(0, stock[kind] ?? 0);
      const label = this.toolLabels[kind];
      if (!label) {
        continue;
      }

      const marker = selectedTool === kind ? '▶ ' : '  ';
      label.string = `${marker}${TOOL_NAME[kind]} × ${remaining}`;
      label.color = remaining > 0 ? new Color(230, 240, 255, 255) : new Color(126, 137, 156, 255);
    }

    if (this.toolbarStatusLabel) {
      this.toolbarStatusLabel.string = selectedTool
        ? `已选道具：${TOOL_NAME[selectedTool]}`
        : '点击道具后再点棋盘放置';
    }
  }

  public setRotateEnabled(enabled: boolean) {
    const color = enabled ? new Color(214, 232, 255, 255) : new Color(132, 144, 166, 255);
    this.setNodeLabelColor(this.rotateLeftNode, color);
    this.setNodeLabelColor(this.rotateRightNode, color);
  }

  public showVictory(message: string) {
    if (this.victoryMessageLabel) {
      this.victoryMessageLabel.string = message;
    }
    if (this.victoryPanel) {
      this.victoryPanel.active = true;
    }
  }

  public hideVictory() {
    if (this.victoryPanel) {
      this.victoryPanel.active = false;
    }
  }

  private ensureNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node {
    const node = parent.getChildByName(name) ?? new Node(name);
    if (!node.parent) {
      node.layer = parent.layer;
      node.parent = parent;
    }
    node.layer = parent.layer;

    node.setPosition(x, y, 0);
    const transform = node.getComponent(UITransform) ?? node.addComponent(UITransform);
    transform.setContentSize(width, height);
    return node;
  }

  private ensureLabel(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
  ): Label {
    const node = this.ensureNode(parent, name, x, y, 220, fontSize + 12);
    const label = node.getComponent(Label) ?? node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
    label.horizontalAlign = 1;
    return label;
  }

  private ensureButton(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
    onTap: () => void,
  ): Node {
    const node = this.ensureNode(parent, name, x, y, width, height);
    const label = node.getComponent(Label) ?? node.addComponent(Label);
    label.string = text;
    label.fontSize = 20;
    label.lineHeight = 24;
    label.color = color;
    label.horizontalAlign = 1;

    if (!(node as { __runtimeTapBound__?: boolean }).__runtimeTapBound__) {
      (node as { __runtimeTapBound__?: boolean }).__runtimeTapBound__ = true;
      node.on(Input.EventType.TOUCH_END, onTap, this);
    }

    return node;
  }

  private setNodeLabelColor(node: Node | null, color: Color) {
    if (!node) {
      return;
    }

    const label = node.getComponent(Label);
    if (label) {
      label.color = color;
    }
  }
}

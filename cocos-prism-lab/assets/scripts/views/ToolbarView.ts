import { _decorator, Color, Component, EventTouch, Input, Label, Node, UITransform, Vec3 } from 'cc';
import type { ToolKind, ToolStock } from '../core/optics/types';

const { ccclass } = _decorator;

type ToolCounts = Record<ToolKind, number>;

const TOOL_ORDER: ToolKind[] = ['mirror', 'portableConcentrator', 'prism'];
const TOOL_LABEL: Record<ToolKind, string> = {
  mirror: '镜子',
  portableConcentrator: '聚光器',
  prism: '棱镜',
};

@ccclass('ToolbarView')
export class ToolbarView extends Component {
  private selectHandler: ((kind: ToolKind) => void) | null = null;
  private slots: Partial<Record<ToolKind, Label>> = {};
  private statusLabel: Label | null = null;

  onLoad() {
    this.ensureLayout();
    this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onDestroy() {
    this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  public bindSelectHandler(handler: (kind: ToolKind) => void) {
    this.selectHandler = handler;
  }

  public refresh(stock: ToolStock, used: ToolCounts, selectedTool: ToolKind | null) {
    for (const kind of TOOL_ORDER) {
      const total = stock[kind] ?? 0;
      const usedCount = used[kind] ?? 0;
      const remaining = Math.max(0, total - usedCount);
      const marker = selectedTool === kind ? '▶ ' : '  ';
      const label = this.slots[kind];
      if (label) {
        label.string = `${marker}${TOOL_LABEL[kind]} ${remaining}/${total}`;
        label.color = remaining > 0 ? new Color(230, 240, 255, 255) : new Color(126, 137, 156, 255);
      }
    }

    if (this.statusLabel) {
      this.statusLabel.string = selectedTool ? `已选：${TOOL_LABEL[selectedTool]}` : '点击下方切换道具';
    }
  }

  private onTouchEnd(event: EventTouch) {
    const kind = this.resolveToolFromTouch(event);
    if (!kind) {
      return;
    }
    this.selectHandler?.(kind);
  }

  private resolveToolFromTouch(event: EventTouch): ToolKind | null {
    const ui = this.node.getComponent(UITransform);
    if (!ui) {
      return null;
    }

    const loc = event.getUILocation();
    const local = ui.convertToNodeSpaceAR(new Vec3(loc.x, loc.y, 0));
    const width = ui.contentSize.width;
    const normalized = (local.x + width / 2) / width;

    if (normalized < 1 / 3) {
      return 'mirror';
    }
    if (normalized < 2 / 3) {
      return 'portableConcentrator';
    }
    return 'prism';
  }

  private ensureLayout() {
    const ui = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    if (ui.contentSize.width < 360 || ui.contentSize.height < 96) {
      ui.setContentSize(390, 132);
    }

    const y = 24;
    const spacing = ui.contentSize.width / 3;

    for (let i = 0; i < TOOL_ORDER.length; i += 1) {
      const kind = TOOL_ORDER[i];
      const slotNode = this.node.getChildByName(`Tool-${kind}`) ?? new Node(`Tool-${kind}`);
      if (!slotNode.parent) {
        slotNode.parent = this.node;
      }
      slotNode.setPosition(-ui.contentSize.width / 2 + spacing * (i + 0.5), y, 0);

      const label = slotNode.getComponent(Label) ?? slotNode.addComponent(Label);
      label.string = TOOL_LABEL[kind];
      label.fontSize = 20;
      label.lineHeight = 26;
      label.color = new Color(220, 232, 255, 255);
      label.horizontalAlign = 1;
      this.slots[kind] = label;
    }

    const statusNode = this.node.getChildByName('ToolbarStatus') ?? new Node('ToolbarStatus');
    if (!statusNode.parent) {
      statusNode.parent = this.node;
    }
    statusNode.setPosition(0, -32, 0);

    const status = statusNode.getComponent(Label) ?? statusNode.addComponent(Label);
    status.fontSize = 16;
    status.lineHeight = 20;
    status.color = new Color(141, 205, 255, 255);
    status.horizontalAlign = 1;
    this.statusLabel = status;
  }
}

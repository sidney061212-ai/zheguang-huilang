import { _decorator, Color, Component, Input, Label, Node, UITransform, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('VictoryPanel')
export class VictoryPanel extends Component {
  private messageLabel: Label | null = null;
  private nextLabel: Label | null = null;
  private closeLabel: Label | null = null;
  private nextHandler: (() => void) | null = null;

  onLoad() {
    this.ensureLayout();
    this.hide();
  }

  public show(message: string, onNext?: () => void) {
    this.node.active = true;
    if (this.messageLabel) {
      this.messageLabel.string = message;
    }
    this.nextHandler = onNext ?? null;
  }

  public hide() {
    this.node.active = false;
  }

  private onTapNext() {
    if (this.nextHandler) {
      this.nextHandler();
      return;
    }
    this.hide();
  }

  private onTapClose() {
    this.hide();
  }

  private ensureLayout() {
    const ui = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    if (ui.contentSize.width < 360 || ui.contentSize.height < 220) {
      ui.setContentSize(390, 220);
    }

    const messageNode = this.node.getChildByName('VictoryMessage') ?? new Node('VictoryMessage');
    if (!messageNode.parent) {
      messageNode.parent = this.node;
    }
    messageNode.setPosition(0, 34, 0);
    const msg = messageNode.getComponent(Label) ?? messageNode.addComponent(Label);
    msg.string = '通关成功';
    msg.fontSize = 28;
    msg.lineHeight = 34;
    msg.color = new Color(238, 245, 255, 255);
    msg.horizontalAlign = 1;
    this.messageLabel = msg;

    const nextNode = this.ensureActionLabel('VictoryNext', '下一关', -66, -52, new Color(120, 214, 132, 255));
    nextNode.on(Input.EventType.TOUCH_END, this.onTapNext, this);
    this.nextLabel = nextNode.getComponent(Label);

    const closeNode = this.ensureActionLabel('VictoryClose', '关闭', 66, -52, new Color(194, 202, 219, 255));
    closeNode.on(Input.EventType.TOUCH_END, this.onTapClose, this);
    this.closeLabel = closeNode.getComponent(Label);
  }

  private ensureActionLabel(name: string, text: string, x: number, y: number, color: Color): Node {
    const node = this.node.getChildByName(name) ?? new Node(name);
    if (!node.parent) {
      node.parent = this.node;
    }
    node.setPosition(new Vec3(x, y, 0));

    const label = node.getComponent(Label) ?? node.addComponent(Label);
    label.string = text;
    label.fontSize = 24;
    label.lineHeight = 28;
    label.color = color;
    label.horizontalAlign = 1;

    return node;
  }
}

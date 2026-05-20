import { _decorator, Color, Component, Label, UIOpacity, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ToolButton')
export class ToolButton extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  countLabel: Label | null = null;

  private selected = false;
  private enabled = true;

  public refresh(title: string, remaining: number, total: number, selected: boolean) {
    this.selected = selected;
    this.enabled = remaining > 0;

    if (this.titleLabel) {
      this.titleLabel.string = title;
      this.titleLabel.color = this.enabled ? new Color(229, 238, 255, 255) : new Color(124, 136, 158, 255);
    }

    if (this.countLabel) {
      this.countLabel.string = `${remaining}/${total}`;
      this.countLabel.color = this.enabled ? new Color(141, 205, 255, 255) : new Color(102, 112, 130, 255);
    }

    this.applyVisualState();
  }

  public setSelected(selected: boolean) {
    this.selected = selected;
    this.applyVisualState();
  }

  private applyVisualState() {
    const opacityComp = this.node.getComponent(UIOpacity) ?? this.node.addComponent(UIOpacity);
    opacityComp.opacity = this.enabled ? 255 : 150;

    this.node.scale = this.selected ? new Vec3(1.04, 1.04, 1) : new Vec3(1, 1, 1);
  }
}

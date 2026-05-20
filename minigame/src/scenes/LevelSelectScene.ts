import type { Time } from "../core/Time";
import type { InputButtonTarget } from "../input/InputManager";
import { levels } from "../levels";
import type { ProgressRepository } from "../platform/ProgressRepository";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import type { RenderButton } from "../renderer/types";
import type { ViewportLayout } from "../utils/layout";
import type { Scene } from "./Scene";

export class LevelSelectScene implements Scene {
  readonly name = "level-select";

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly setButtons: (buttons: readonly InputButtonTarget[]) => void,
    private readonly getLayout: () => ViewportLayout,
    private readonly startLevel: (index: number) => void,
    private readonly backHome: () => void
  ) {}

  enter(): void {
    this.setButtons(this.createInputButtons());
  }

  exit(): void {
    this.setButtons([]);
  }

  update(_time: Time): void {}

  render(renderer: CanvasRenderer): void {
    renderer.renderMenu({
      title: "选择关卡",
      subtitle: "v0.1 镜子玩法",
      caption: "已解锁关卡可直接进入。",
      buttons: this.createRenderButtons()
    });
  }

  private createRenderButtons(): RenderButton[] {
    const layout = this.getLayout();
    const topButtonHeight = Math.max(46, Math.round(layout.topBar.height * 0.72));
    const topButtonWidth = Math.min(176, Math.max(132, layout.topBar.width * 0.28));
    const topButtonY = layout.topBar.y + (layout.topBar.height - topButtonHeight) / 2;

    const rowWidth = Math.max(220, layout.playArea.width - Math.max(20, layout.playArea.width * 0.08) * 2);
    const rowHeight = Math.max(56, Math.min(76, Math.round(layout.playArea.height * 0.105)));
    const rowX = layout.centerX - rowWidth / 2;
    const maxGapBudget = layout.playArea.height - rowHeight * levels.length - 30;
    const rowGap = levels.length > 1 ? Math.max(10, Math.min(24, maxGapBudget / (levels.length - 1))) : 0;
    const contentHeight = rowHeight * levels.length + rowGap * Math.max(0, levels.length - 1);
    const startY = layout.playArea.y + Math.max(14, (layout.playArea.height - contentHeight) / 2);

    const buttons: RenderButton[] = [
      {
        id: "level-select:back",
        label: "返回首页",
        x: layout.topBar.x,
        y: topButtonY,
        width: topButtonWidth,
        height: topButtonHeight
      }
    ];

    for (let index = 0; index < levels.length; index += 1) {
      const level = levels[index];
      const unlocked = this.isUnlocked(index);
      buttons.push({
        id: `level-select:${index}`,
        label: unlocked ? `${index + 1}. ${level.name}` : `${index + 1}. 未解锁`,
        x: rowX,
        y: startY + index * (rowHeight + rowGap),
        width: rowWidth,
        height: rowHeight,
        enabled: unlocked
      });
    }

    return buttons;
  }

  private createInputButtons(): InputButtonTarget[] {
    return this.createRenderButtons().map((button) => ({
      id: button.id,
      bounds: {
        x: button.x,
        y: button.y,
        width: button.width,
        height: button.height
      },
      enabled: button.enabled !== false,
      visible: true,
      onClick: () => {
        if (button.id === "level-select:back") {
          this.backHome();
          return;
        }

        const levelIndex = Number(button.id.replace("level-select:", ""));
        if (Number.isInteger(levelIndex)) {
          this.startLevel(levelIndex);
        }
      }
    }));
  }

  private isUnlocked(index: number): boolean {
    if (index === 0) return true;
    return this.progressRepository.getLevelProgress(levels[index - 1].id).completed;
  }
}

import type { Time } from "../core/Time";
import type { InputButtonTarget } from "../input/InputManager";
import { levels } from "../levels";
import type { ProgressRepository } from "../platform/ProgressRepository";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import type { RenderButton } from "../renderer/types";
import type { Scene } from "./Scene";

export class LevelSelectScene implements Scene {
  readonly name = "level-select";

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly setButtons: (buttons: readonly InputButtonTarget[]) => void,
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
    const buttons: RenderButton[] = [
      {
        id: "level-select:back",
        label: "返回首页",
        x: 42,
        y: 48,
        width: 170,
        height: 56
      }
    ];

    for (let index = 0; index < levels.length; index += 1) {
      const level = levels[index];
      const unlocked = this.isUnlocked(index);
      buttons.push({
        id: `level-select:${index}`,
        label: unlocked ? `${index + 1}. ${level.name}` : `${index + 1}. 未解锁`,
        x: 95,
        y: 420 + index * 92,
        width: 560,
        height: 70,
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

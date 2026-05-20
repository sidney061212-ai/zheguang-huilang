import type { Time } from "../core/Time";
import type { InputButtonTarget } from "../input/InputManager";
import type { ProgressRepository } from "../platform/ProgressRepository";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import type { RenderButton } from "../renderer/types";
import type { ViewportLayout } from "../utils/layout";
import type { Scene } from "./Scene";

export class HomeScene implements Scene {
  readonly name = "home";

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly setButtons: (buttons: readonly InputButtonTarget[]) => void,
    private readonly getLayout: () => ViewportLayout,
    private readonly navigateToLevelSelect: () => void,
    private readonly startLatestUnlockedLevel: () => void
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
      title: "折光回廊",
      subtitle: "Prism Lab",
      caption: "拖动并旋转镜子，让光命中目标。",
      buttons: this.createRenderButtons()
    });
  }

  private createRenderButtons(): RenderButton[] {
    const layout = this.getLayout();
    const buttonWidth = Math.min(360, Math.max(250, layout.playArea.width * 0.72));
    const buttonHeight = Math.max(58, Math.round(layout.playArea.height * 0.09));
    const x = layout.centerX - buttonWidth / 2;
    const startY = layout.playArea.y + Math.round(layout.playArea.height * 0.48);
    const verticalGap = Math.max(14, Math.round(layout.playArea.height * 0.03));
    const snapshot = this.progressRepository.getSnapshot();
    const hasProgress = Object.values(snapshot.levels).some((progress) => progress.completed);
    return [
      {
        id: "home:start",
        label: "开始游戏",
        x,
        y: startY,
        width: buttonWidth,
        height: buttonHeight
      },
      {
        id: "home:continue",
        label: "继续游戏",
        x,
        y: startY + buttonHeight + verticalGap,
        width: buttonWidth,
        height: buttonHeight
      }
    ].map((button) => ({
      ...button,
      enabled: button.id !== "home:continue" || hasProgress
    }));
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
        if (button.id === "home:start") {
          this.navigateToLevelSelect();
        }
        if (button.id === "home:continue") {
          this.startLatestUnlockedLevel();
        }
      }
    }));
  }
}

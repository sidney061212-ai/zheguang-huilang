import type { EventBus } from "../core/EventBus";
import type { Time } from "../core/Time";
import type { LevelConfig } from "../levels/LevelConfig";
import { levels } from "../levels";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import { RaycastSystem } from "../rules/RaycastSystem";
import { WinConditionSystem } from "../rules/WinConditionSystem";
import type { Scene } from "./Scene";

export class GameScene implements Scene {
  readonly name = "game";
  private currentLevel: LevelConfig = levels[0];
  private readonly raycastSystem = new RaycastSystem();
  private readonly winConditionSystem = new WinConditionSystem();

  constructor(private readonly eventBus: EventBus) {}

  enter(): void {
    this.loadLevel(0);
  }

  exit(): void {}

  update(_time: Time): void {
    const result = this.raycastSystem.simulate(this.currentLevel);
    if (this.winConditionSystem.isWin(result)) {
      this.eventBus.emit("level:win", { levelId: this.currentLevel.id });
    }
  }

  render(renderer: CanvasRenderer): void {
    renderer.renderScene(this.currentLevel.name, this.currentLevel.hint);
  }

  loadLevel(index: number): void {
    this.currentLevel = levels[index] ?? levels[0];
    this.eventBus.emit("level:start", { levelId: this.currentLevel.id });
  }
}

import type { EventBus } from "../core/EventBus";
import type { Time } from "../core/Time";
import type { EntityId } from "../entities/types";
import type { InputAction, InputButtonTarget } from "../input/InputManager";
import { InputManager } from "../input/InputManager";
import type { LevelConfig } from "../levels/LevelConfig";
import { levels } from "../levels";
import type { ProgressRepository } from "../platform/ProgressRepository";
import type { CanvasRenderer } from "../renderer/CanvasRenderer";
import type { RenderButton } from "../renderer/types";
import { RaycastSystem } from "../rules/RaycastSystem";
import type { RaycastResult } from "../rules/RaycastSystem";
import { WinConditionSystem } from "../rules/WinConditionSystem";
import { clamp } from "../utils/math";
import type { Scene } from "./Scene";

export class GameScene implements Scene {
  readonly name = "game";
  private currentLevelIndex = 0;
  private currentLevel: LevelConfig = cloneLevel(levels[0]);
  private raycastResult: RaycastResult;
  private selectedMirrorId: EntityId | null = null;
  private hasWon = false;
  private mirrorMoves = 0;
  private readonly raycastSystem = new RaycastSystem();
  private readonly winConditionSystem = new WinConditionSystem();
  private readonly actionHandler = (action: InputAction): void => this.handleInputAction(action);

  constructor(
    private readonly eventBus: EventBus,
    private readonly input: InputManager,
    private readonly progressRepository: ProgressRepository,
    private readonly backToLevelSelect: () => void,
    private readonly goToNextLevel: () => void
  ) {
    this.raycastResult = this.raycastSystem.simulate(this.currentLevel);
  }

  enter(): void {
    this.input.onAction(this.actionHandler);
    this.syncInputTargets();
    this.recalculate();
  }

  exit(): void {
    this.input.offAction(this.actionHandler);
    this.input.setMirrors([]);
    this.input.setButtons([]);
  }

  update(_time: Time): void {}

  render(renderer: CanvasRenderer): void {
    renderer.renderLevel({
      level: this.currentLevel,
      raySegments: this.raycastResult.segments,
      hitTargetIds: this.raycastResult.hitTargetIds,
      selectedMirrorId: this.selectedMirrorId,
      buttons: this.createTopButtons(),
      victoryDialog: this.hasWon
        ? {
            visible: true,
            title: "通关",
            message: "光已命中目标。",
            primaryButton: this.createNextButton(),
            secondaryButton: this.createReplayButton()
          }
        : undefined
    });
  }

  loadLevel(index: number): void {
    this.currentLevelIndex = clamp(index, 0, levels.length - 1);
    this.currentLevel = cloneLevel(levels[this.currentLevelIndex]);
    this.selectedMirrorId = null;
    this.hasWon = false;
    this.mirrorMoves = 0;
    this.input.selectMirror(null);
    this.eventBus.emit("level:start", { levelId: this.currentLevel.id });
    this.recalculate();
    this.syncInputTargets();
  }

  resetLevel(): void {
    this.loadLevel(this.currentLevelIndex);
  }

  getCurrentLevelIndex(): number {
    return this.currentLevelIndex;
  }

  private handleInputAction(action: InputAction): void {
    if (action.type === "button:press" || action.type === "button:click") return;

    if (action.type === "mirror:select") {
      this.selectedMirrorId = action.mirrorId;
      return;
    }

    if (action.type === "selection:clear") {
      this.selectedMirrorId = null;
      return;
    }

    if (this.hasWon) return;

    if (action.type === "mirror:drag") {
      const mirror = this.findMirror(action.mirrorId);
      if (!mirror?.movable) return;
      mirror.position = {
        x: clamp(action.nextPosition.x, 48, 702),
        y: clamp(action.nextPosition.y, 150, 1130)
      };
      this.recalculate();
      this.syncInputTargets();
      return;
    }

    if (action.type === "mirror:rotate") {
      const mirror = this.findMirror(action.mirrorId);
      if (!mirror?.movable) return;
      mirror.rotation = action.rotation;
      this.recalculate();
      this.syncInputTargets();
      return;
    }

    if (action.type === "mirror:release" && action.interaction !== "tap") {
      this.mirrorMoves += 1;
    }
  }

  private recalculate(): void {
    this.raycastResult = this.raycastSystem.simulate(this.currentLevel);
    const hitTargetIds = new Set(this.raycastResult.hitTargetIds);
    for (const target of this.currentLevel.targets) {
      target.hit = hitTargetIds.has(target.id);
    }

    if (!this.hasWon && this.winConditionSystem.isWin(this.raycastResult)) {
      this.hasWon = true;
      this.progressRepository.markLevelCompleted(this.currentLevel.id, this.mirrorMoves);
      this.eventBus.emit("target:hit", { levelId: this.currentLevel.id });
      this.eventBus.emit("level:win", { levelId: this.currentLevel.id });
      this.syncInputTargets();
    }
  }

  private syncInputTargets(): void {
    this.input.setMirrors(this.currentLevel.mirrors);
    this.input.setButtons(this.createInputButtons());
  }

  private createInputButtons(): InputButtonTarget[] {
    return [...this.createTopButtons(), ...(this.hasWon ? [this.createNextButton(), this.createReplayButton()] : [])].map(
      (button) => ({
        id: button.id,
        bounds: {
          x: button.x,
          y: button.y,
          width: button.width,
          height: button.height
        },
        enabled: button.enabled !== false,
        visible: button.visible !== false,
        onClick: () => this.handleButtonClick(button.id)
      })
    );
  }

  private createTopButtons(): RenderButton[] {
    return [
      {
        id: "game:back",
        label: "返回",
        x: 42,
        y: 118,
        width: 140,
        height: 56
      },
      {
        id: "game:reset",
        label: "重置",
        x: 568,
        y: 118,
        width: 140,
        height: 56
      }
    ];
  }

  private createNextButton(): RenderButton {
    return {
      id: "game:next",
      label: this.currentLevelIndex >= levels.length - 1 ? "返回选关" : "下一关",
      x: 220,
      y: 440,
      width: 310,
      height: 64
    };
  }

  private createReplayButton(): RenderButton {
    return {
      id: "game:replay",
      label: "重玩本关",
      x: 220,
      y: 520,
      width: 310,
      height: 64
    };
  }

  private handleButtonClick(buttonId: EntityId): void {
    this.eventBus.emit("ui:click", { buttonId });
    if (buttonId === "game:back") {
      this.backToLevelSelect();
      return;
    }
    if (buttonId === "game:reset" || buttonId === "game:replay") {
      this.resetLevel();
      return;
    }
    if (buttonId === "game:next") {
      this.goToNextLevel();
    }
  }

  private findMirror(mirrorId: EntityId) {
    return this.currentLevel.mirrors.find((mirror) => mirror.id === mirrorId) ?? null;
  }
}

function cloneLevel(level: LevelConfig): LevelConfig {
  return {
    ...level,
    lightSource: {
      ...level.lightSource,
      position: { ...level.lightSource.position },
      direction: { ...level.lightSource.direction }
    },
    mirrors: level.mirrors.map((mirror) => ({
      ...mirror,
      position: { ...mirror.position }
    })),
    prisms: level.prisms.map((prism) => ({
      ...prism,
      position: { ...prism.position }
    })),
    targets: level.targets.map((target) => ({
      ...target,
      position: { ...target.position }
    })),
    walls: level.walls.map((wall) => ({
      ...wall,
      position: { ...wall.position }
    })),
    acceptance: { ...level.acceptance }
  };
}

import type { LightSource, Wall } from "../entities/types";
import type { LevelConfig } from "../levels/LevelConfig";
import { Button, type ButtonRenderState } from "../ui/Button";
import { VictoryDialog } from "../ui/VictoryDialog";
import { MirrorRenderer } from "./MirrorRenderer";
import { PrismRenderer } from "./PrismRenderer";
import { RayRenderer } from "./RayRenderer";
import { TargetRenderer } from "./TargetRenderer";
import type { LevelRenderState, MenuRenderState, RenderButton } from "./types";

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly mirrorRenderer = new MirrorRenderer();
  private readonly prismRenderer = new PrismRenderer();
  private readonly rayRenderer = new RayRenderer();
  private readonly targetRenderer = new TargetRenderer();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context is not available");
    }
    this.context = context;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  getSize(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderScene(title: string, subtitle: string): void {
    this.clear();
    this.context.fillStyle = "#f6fbff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "#20385f";
    this.context.font = "24px sans-serif";
    this.context.fillText(title, 24, 56);
    this.context.font = "14px sans-serif";
    this.context.fillText(subtitle, 24, 86);
  }

  renderMenu(state: MenuRenderState): void {
    this.clear();
    this.drawBackground();

    this.context.save();
    this.context.fillStyle = "#20385f";
    this.context.font = "700 48px sans-serif";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(state.title, this.canvas.width / 2, 210);

    this.context.fillStyle = "#5f7590";
    this.context.font = "24px sans-serif";
    this.context.fillText(state.subtitle, this.canvas.width / 2, 260);

    if (state.caption) {
      this.context.fillStyle = "#8293a8";
      this.context.font = "20px sans-serif";
      this.context.fillText(state.caption, this.canvas.width / 2, 304);
    }
    this.context.restore();

    this.drawButtons(state.buttons);
  }

  renderLevel(state: LevelRenderState): void {
    this.clear();
    this.drawBackground();
    this.drawHeader(state.level);
    this.drawWorld(state);
    this.drawButtons(state.buttons ?? []);
    this.drawVictoryDialog(state.victoryDialog);
  }

  private drawBackground(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const context = this.context;

    context.save();
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#eaf6ff");
    gradient.addColorStop(1, "#f7fbff");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(80, 113, 148, 0.1)";
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 48) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y <= height; y += 48) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();
  }

  private drawHeader(level: LevelConfig): void {
    const context = this.context;
    context.save();
    context.fillStyle = "#20385f";
    context.font = "700 34px sans-serif";
    context.fillText(level.name, 32, 60);
    context.fillStyle = "#5f7590";
    context.font = "24px sans-serif";
    context.fillText(level.hint, 32, 96);
    context.restore();
  }

  private drawWorld(state: LevelRenderState): void {
    const context = this.context;
    const hitTargetIds = new Set(state.hitTargetIds ?? []);

    this.drawLightSource(state.level.lightSource);

    for (const wall of state.level.walls) {
      this.drawWall(wall);
    }

    for (const target of state.level.targets) {
      this.targetRenderer.render(context, target, target.hit || hitTargetIds.has(target.id));
    }

    for (const prism of state.level.prisms) {
      this.prismRenderer.render(context, prism);
    }

    for (const mirror of state.level.mirrors) {
      this.mirrorRenderer.render(context, mirror, { selected: mirror.id === state.selectedMirrorId });
    }

    if (state.raySegments) {
      this.rayRenderer.render(context, state.raySegments);
    }
  }

  private drawLightSource(lightSource: LightSource): void {
    if (!lightSource.enabled) return;

    const context = this.context;
    const directionLength = 34;
    const direction = normalize(lightSource.direction);
    const tip = {
      x: lightSource.position.x + direction.x * directionLength,
      y: lightSource.position.y + direction.y * directionLength
    };

    context.save();
    context.beginPath();
    context.arc(lightSource.position.x, lightSource.position.y, 18, 0, Math.PI * 2);
    context.fillStyle = "#fff8d6";
    context.fill();
    context.strokeStyle = "#f5bc42";
    context.lineWidth = 3;
    context.stroke();

    context.beginPath();
    context.moveTo(lightSource.position.x, lightSource.position.y);
    context.lineTo(tip.x, tip.y);
    context.strokeStyle = "#f5bc42";
    context.lineWidth = 5;
    context.lineCap = "round";
    context.stroke();

    context.beginPath();
    context.moveTo(tip.x, tip.y);
    context.lineTo(tip.x - direction.x * 12 - direction.y * 7, tip.y - direction.y * 12 + direction.x * 7);
    context.lineTo(tip.x - direction.x * 12 + direction.y * 7, tip.y - direction.y * 12 - direction.x * 7);
    context.closePath();
    context.fillStyle = "#f5bc42";
    context.fill();
    context.restore();
  }

  private drawWall(wall: Wall): void {
    if (!wall.enabled) return;

    const context = this.context;
    context.save();
    context.fillStyle = "#26384d";
    context.strokeStyle = "#111b2b";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(wall.position.x, wall.position.y, wall.width, wall.height, 4);
    context.fill();
    context.stroke();

    context.strokeStyle = "rgba(255, 255, 255, 0.14)";
    context.lineWidth = 1;
    for (let x = wall.position.x + 10; x < wall.position.x + wall.width; x += 16) {
      context.beginPath();
      context.moveTo(x, wall.position.y + 4);
      context.lineTo(x - wall.height, wall.position.y + wall.height - 4);
      context.stroke();
    }
    context.restore();
  }

  private drawButtons(buttons: readonly RenderButton[]): void {
    for (const button of buttons) {
      if (button.visible === false) continue;
      Button.render(this.context, toButtonRenderState(button));
    }
  }

  private drawVictoryDialog(state: LevelRenderState["victoryDialog"]): void {
    if (!state?.visible) return;
    VictoryDialog.render(this.context, {
      x: 70,
      y: 310,
      width: this.canvas.width - 140,
      title: state.title ?? "Level Complete",
      message: state.message ?? "The target path is solved.",
      primaryButton: state.primaryButton ? toButtonRenderState(state.primaryButton) : undefined,
      secondaryButton: state.secondaryButton ? toButtonRenderState(state.secondaryButton) : undefined
    });
  }
}

function normalize(vector: { x: number; y: number }): { x: number; y: number } {
  const length = Math.hypot(vector.x, vector.y);
  if (length < 1e-8) return { x: 1, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

function toButtonRenderState(button: RenderButton): ButtonRenderState {
  return {
    label: button.label,
    x: button.x,
    y: button.y,
    width: button.width,
    height: button.height,
    enabled: button.enabled
  };
}

import type { LightSource, Wall } from "../entities/types";
import type { LevelConfig } from "../levels/LevelConfig";
import { Button, type ButtonRenderState } from "../ui/Button";
import { VictoryDialog } from "../ui/VictoryDialog";
import { createViewportLayout, type ViewportLayout } from "../utils/layout";
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
    this.context.fillStyle = "#f2f9ff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "#20385f";
    this.context.font = "24px sans-serif";
    this.context.fillText(title, 24, 56);
    this.context.font = "14px sans-serif";
    this.context.fillText(subtitle, 24, 86);
  }

  renderMenu(state: MenuRenderState): void {
    this.clear();
    const layout = createViewportLayout(this.canvas.width, this.canvas.height);
    this.drawBackground(layout);
    this.drawPlayArea(layout);

    this.context.save();
    this.context.fillStyle = "#1f4466";
    this.context.font = "700 46px sans-serif";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(state.title, layout.centerX, layout.playArea.y + layout.playArea.height * 0.2);

    this.context.fillStyle = "#5f7b96";
    this.context.font = "24px sans-serif";
    this.context.fillText(state.subtitle, layout.centerX, layout.playArea.y + layout.playArea.height * 0.29);

    if (state.caption) {
      this.context.fillStyle = "#8399ae";
      this.context.font = "20px sans-serif";
      this.context.fillText(state.caption, layout.centerX, layout.playArea.y + layout.playArea.height * 0.36);
    }
    this.context.restore();

    this.drawButtons(state.buttons);
  }

  renderLevel(state: LevelRenderState): void {
    this.clear();
    const layout = createViewportLayout(this.canvas.width, this.canvas.height);
    this.drawBackground(layout);
    this.drawHeader(state.level, layout);
    this.drawPlayArea(layout);
    this.drawWorld(state, layout);
    this.drawButtons(state.buttons ?? []);
    this.drawVictoryDialog(state.victoryDialog, layout);
  }

  private drawBackground(layout: ViewportLayout): void {
    const width = layout.width;
    const height = layout.height;
    const context = this.context;

    context.save();
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#e9f7ff");
    gradient.addColorStop(0.55, "#f4fbff");
    gradient.addColorStop(1, "#eff7ff");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const glowA = context.createRadialGradient(width * 0.16, height * 0.1, 0, width * 0.16, height * 0.1, width * 0.45);
    glowA.addColorStop(0, "rgba(151, 215, 255, 0.32)");
    glowA.addColorStop(1, "rgba(151, 215, 255, 0)");
    context.fillStyle = glowA;
    context.fillRect(0, 0, width, height);

    const glowB = context.createRadialGradient(width * 0.82, height * 0.15, 0, width * 0.82, height * 0.15, width * 0.36);
    glowB.addColorStop(0, "rgba(223, 240, 255, 0.92)");
    glowB.addColorStop(1, "rgba(223, 240, 255, 0)");
    context.fillStyle = glowB;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(95, 130, 164, 0.06)";
    context.lineWidth = 1;
    const step = Math.max(72, Math.round(width * 0.16));
    for (let x = 0; x <= width; x += step) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    context.restore();
  }

  private drawPlayArea(layout: ViewportLayout): void {
    const context = this.context;
    context.save();
    context.beginPath();
    context.roundRect(
      layout.playArea.x,
      layout.playArea.y,
      layout.playArea.width,
      layout.playArea.height,
      18
    );
    context.fillStyle = "rgba(255, 255, 255, 0.74)";
    context.fill();
    context.strokeStyle = "rgba(122, 158, 191, 0.28)";
    context.lineWidth = 1.5;
    context.stroke();

    context.beginPath();
    context.moveTo(layout.playArea.x + 16, layout.playArea.y + 18);
    context.lineTo(layout.playArea.x + layout.playArea.width - 16, layout.playArea.y + 18);
    context.strokeStyle = "rgba(122, 158, 191, 0.2)";
    context.lineWidth = 1;
    context.stroke();
    context.restore();
  }

  private drawHeader(level: LevelConfig, layout: ViewportLayout): void {
    const context = this.context;
    context.save();
    context.fillStyle = "#1f4466";
    context.font = "700 28px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(level.name, layout.centerX, layout.topBar.y + layout.topBar.height * 0.34);

    context.fillStyle = "#5f7b96";
    context.font = "20px sans-serif";
    context.fillText(level.hint, layout.centerX, layout.topBar.y + layout.topBar.height * 0.76);
    context.restore();
  }

  private drawWorld(state: LevelRenderState, layout: ViewportLayout): void {
    const context = this.context;
    const hitTargetIds = new Set(state.hitTargetIds ?? []);

    context.save();
    context.beginPath();
    context.roundRect(layout.playArea.x + 2, layout.playArea.y + 2, layout.playArea.width - 4, layout.playArea.height - 4, 14);
    context.clip();

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

    context.restore();
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
    context.fillStyle = "#fffbe4";
    context.fill();
    context.strokeStyle = "#f0bf4e";
    context.lineWidth = 2.5;
    context.stroke();

    context.beginPath();
    context.moveTo(lightSource.position.x, lightSource.position.y);
    context.lineTo(tip.x, tip.y);
    context.strokeStyle = "#f0bf4e";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.stroke();

    context.beginPath();
    context.moveTo(tip.x, tip.y);
    context.lineTo(tip.x - direction.x * 12 - direction.y * 7, tip.y - direction.y * 12 + direction.x * 7);
    context.lineTo(tip.x - direction.x * 12 + direction.y * 7, tip.y - direction.y * 12 - direction.x * 7);
    context.closePath();
    context.fillStyle = "#f0bf4e";
    context.fill();
    context.restore();
  }

  private drawWall(wall: Wall): void {
    if (!wall.enabled) return;

    const context = this.context;
    context.save();
    context.fillStyle = "#3a4f63";
    context.strokeStyle = "#6f869b";
    context.lineWidth = 1.5;
    context.beginPath();
    context.roundRect(wall.position.x, wall.position.y, wall.width, wall.height, 5);
    context.fill();
    context.stroke();

    context.strokeStyle = "rgba(255, 255, 255, 0.16)";
    context.lineWidth = 1;
    const hatchGap = Math.max(18, Math.round(wall.width * 0.4));
    for (let x = wall.position.x + 8; x < wall.position.x + wall.width; x += hatchGap) {
      context.beginPath();
      context.moveTo(x, wall.position.y + 5);
      context.lineTo(x - 10, wall.position.y + wall.height - 5);
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

  private drawVictoryDialog(state: LevelRenderState["victoryDialog"], layout: ViewportLayout): void {
    if (!state?.visible) return;
    VictoryDialog.render(this.context, {
      x: layout.dialog.x,
      y: layout.dialog.y,
      width: layout.dialog.width,
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

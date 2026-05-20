import type { Vector2 } from "../entities/types";
import type { InputButtonTarget } from "../input/InputManager";

export type ButtonRenderState = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  enabled?: boolean;
  pressed?: boolean;
};

export class Button {
  constructor(
    readonly label: string,
    readonly position: Vector2,
    readonly width: number,
    readonly height: number,
    private readonly onClick: () => void,
    readonly id: string = label
  ) {}

  contains(point: Vector2): boolean {
    return (
      point.x >= this.position.x &&
      point.x <= this.position.x + this.width &&
      point.y >= this.position.y &&
      point.y <= this.position.y + this.height
    );
  }

  click(): void {
    this.onClick();
  }

  toInputTarget(): InputButtonTarget {
    return {
      id: this.id,
      bounds: {
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height
      },
      enabled: true,
      visible: true,
      onClick: () => this.click()
    };
  }

  render(context: CanvasRenderingContext2D, pressed = false): void {
    Button.render(context, {
      label: this.label,
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
      pressed
    });
  }

  static render(context: CanvasRenderingContext2D, state: ButtonRenderState): void {
    const enabled = state.enabled !== false;
    context.save();
    context.globalAlpha = enabled ? 1 : 0.48;
    context.beginPath();
    context.roundRect(state.x, state.y, state.width, state.height, 10);
    context.fillStyle = state.pressed ? "#1f79d9" : "#2a92ff";
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.68)";
    context.lineWidth = 1.6;
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "700 22px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(state.label, state.x + state.width / 2, state.y + state.height / 2 + 1);
    context.restore();
  }
}

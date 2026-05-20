import type { Mirror } from "../entities/types";
import { DEFAULT_MIRROR_INTERACTION_METRICS, getMirrorRotationHandlePosition } from "../input/InputManager";

export type MirrorRenderOptions = {
  selected?: boolean;
};

export class MirrorRenderer {
  render(context: CanvasRenderingContext2D, mirror: Mirror, options: MirrorRenderOptions = {}): void {
    if (!mirror.enabled) return;

    const halfLength = mirror.length / 2;
    context.save();
    context.translate(mirror.position.x, mirror.position.y);
    context.rotate(mirror.rotation);

    if (options.selected) {
      context.beginPath();
      context.roundRect(
        -halfLength - 10,
        -12,
        mirror.length + 20,
        24,
        10
      );
      context.fillStyle = "rgba(98, 172, 255, 0.1)";
      context.fill();
      context.strokeStyle = "rgba(29, 128, 255, 0.66)";
      context.lineWidth = 2;
      context.stroke();
    }

    context.beginPath();
    context.moveTo(-halfLength, 0);
    context.lineTo(halfLength, 0);
    context.strokeStyle = mirror.movable ? "#d7e4f2" : "#b0bbc8";
    context.lineWidth = 10;
    context.lineCap = "round";
    context.stroke();

    context.beginPath();
    context.moveTo(-halfLength + 4, -3);
    context.lineTo(halfLength - 4, -3);
    context.strokeStyle = mirror.movable ? "#ffffff" : "#d5dce4";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.stroke();

    context.beginPath();
    context.moveTo(-halfLength + 6, 4);
    context.lineTo(halfLength - 6, 4);
    context.strokeStyle = mirror.movable ? "#637589" : "#7a8795";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.stroke();
    context.restore();

    if (options.selected && mirror.movable) {
      this.renderRotationHandle(context, mirror);
    }
  }

  private renderRotationHandle(context: CanvasRenderingContext2D, mirror: Mirror): void {
    const handle = getMirrorRotationHandlePosition(mirror, DEFAULT_MIRROR_INTERACTION_METRICS);
    context.save();
    context.beginPath();
    context.moveTo(mirror.position.x, mirror.position.y);
    context.lineTo(handle.x, handle.y);
    context.strokeStyle = "rgba(29, 128, 255, 0.5)";
    context.lineWidth = 2;
    context.setLineDash([5, 4]);
    context.stroke();
    context.setLineDash([]);

    context.beginPath();
    context.arc(handle.x, handle.y, DEFAULT_MIRROR_INTERACTION_METRICS.rotationHandleRadius, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 255, 255, 0.95)";
    context.fill();
    context.strokeStyle = "#1d80ff";
    context.lineWidth = 2.5;
    context.stroke();

    context.beginPath();
    context.arc(handle.x, handle.y, 5, 0, Math.PI * 2);
    context.fillStyle = "#1d80ff";
    context.fill();
    context.restore();
  }
}

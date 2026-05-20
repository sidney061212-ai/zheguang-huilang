import type { Prism } from "../entities/types";

export class PrismRenderer {
  // v0.1 placeholder visual only; prism logic is not in playable path yet.
  render(context: CanvasRenderingContext2D, prism: Prism): void {
    if (!prism.enabled) return;

    const height = prism.size * Math.sqrt(3);
    context.save();
    context.translate(prism.position.x, prism.position.y);
    context.rotate(prism.rotation);
    context.beginPath();
    context.moveTo(0, -height / 2);
    context.lineTo(prism.size, height / 2);
    context.lineTo(-prism.size, height / 2);
    context.closePath();
    context.fillStyle = "rgba(176, 232, 255, 0.3)";
    context.fill();
    context.strokeStyle = "#74aee8";
    context.lineWidth = 2.5;
    context.stroke();

    context.beginPath();
    context.moveTo(0, -height / 2 + 8);
    context.lineTo(prism.size - 9, height / 2 - 6);
    context.lineTo(-prism.size + 12, height / 2 - 8);
    context.closePath();
    context.strokeStyle = "rgba(255, 255, 255, 0.78)";
    context.lineWidth = 2;
    context.stroke();
    context.restore();
  }
}

import type { RayColor, Target } from "../entities/types";

const COLOR_SWATCHES: Record<RayColor, string> = {
  white: "#f8fbff",
  red: "#ff5c5c",
  green: "#34c759",
  blue: "#4d8dff"
};

export class TargetRenderer {
  render(context: CanvasRenderingContext2D, target: Target, hit: boolean = target.hit): void {
    context.save();
    context.beginPath();
    context.arc(target.position.x, target.position.y, target.radius + 7, 0, Math.PI * 2);
    context.fillStyle = hit ? "rgba(52, 199, 89, 0.18)" : "rgba(255, 255, 255, 0.7)";
    context.fill();
    context.strokeStyle = hit ? "#34c759" : "#90a4b8";
    context.lineWidth = 3;
    context.stroke();

    context.beginPath();
    context.arc(target.position.x, target.position.y, target.radius, 0, Math.PI * 2);
    context.fillStyle = "#101b2d";
    context.fill();

    context.beginPath();
    context.arc(target.position.x, target.position.y, Math.max(6, target.radius - 8), 0, Math.PI * 2);
    context.fillStyle = hit ? "#34c759" : "#ffffff";
    context.fill();

    this.renderAcceptedColors(context, target);
    context.restore();
  }

  private renderAcceptedColors(context: CanvasRenderingContext2D, target: Target): void {
    const swatchRadius = 4;
    const gap = 3;
    const count = target.acceptedColors.length;
    const totalWidth = count * swatchRadius * 2 + Math.max(0, count - 1) * gap;
    const startX = target.position.x - totalWidth / 2 + swatchRadius;
    const y = target.position.y + target.radius + 17;

    for (let index = 0; index < count; index += 1) {
      const color = target.acceptedColors[index];
      const x = startX + index * (swatchRadius * 2 + gap);
      context.beginPath();
      context.arc(x, y, swatchRadius, 0, Math.PI * 2);
      context.fillStyle = COLOR_SWATCHES[color];
      context.fill();
      context.strokeStyle = color === "white" ? "#9fb0c3" : "rgba(16, 27, 45, 0.28)";
      context.lineWidth = 1;
      context.stroke();
    }
  }
}

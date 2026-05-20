import type { RayColor, RaySegment } from "../entities/types";

const RAY_STROKES: Record<RayColor, string> = {
  white: "#f1fbff",
  red: "#ff5c5c",
  green: "#34c759",
  blue: "#4d8dff"
};

const RAY_GLOWS: Record<RayColor, string> = {
  white: "rgba(140, 210, 255, 0.26)",
  red: "rgba(255, 92, 92, 0.24)",
  green: "rgba(52, 199, 89, 0.24)",
  blue: "rgba(77, 141, 255, 0.28)"
};

export class RayRenderer {
  render(context: CanvasRenderingContext2D, segments: RaySegment[]): void {
    for (const segment of segments) {
      const alpha = clamp((segment.intensityStart + segment.intensityEnd) / 2, 0.15, 1);
      context.save();
      context.globalAlpha = alpha;
      context.beginPath();
      context.moveTo(segment.from.x, segment.from.y);
      context.lineTo(segment.to.x, segment.to.y);
      context.strokeStyle = RAY_GLOWS[segment.color];
      context.lineWidth = 8;
      context.lineCap = "round";
      context.stroke();

      context.beginPath();
      context.moveTo(segment.from.x, segment.from.y);
      context.lineTo(segment.to.x, segment.to.y);
      context.strokeStyle = RAY_STROKES[segment.color];
      context.lineWidth = segment.color === "white" ? 3.6 : 4.4;
      context.lineCap = "round";
      context.shadowColor = RAY_GLOWS[segment.color];
      context.shadowBlur = 7;
      context.stroke();
      context.restore();
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

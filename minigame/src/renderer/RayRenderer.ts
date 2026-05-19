import type { RaySegment } from "../entities/types";

export class RayRenderer {
  render(context: CanvasRenderingContext2D, segments: RaySegment[]): void {
    for (const segment of segments) {
      context.beginPath();
      context.moveTo(segment.from.x, segment.from.y);
      context.lineTo(segment.to.x, segment.to.y);
      context.strokeStyle = segment.color;
      context.lineWidth = 3;
      context.stroke();
    }
  }
}

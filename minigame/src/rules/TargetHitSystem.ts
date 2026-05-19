import type { RaySegment, Target } from "../entities/types";
import { distance } from "../utils/math";

export class TargetHitSystem {
  isHit(segment: RaySegment, target: Target): boolean {
    if (!target.acceptedColors.includes(segment.color)) return false;
    return distance(segment.to, target.position) <= target.radius;
  }
}

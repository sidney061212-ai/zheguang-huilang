import type { Ray, RaySegment } from "../entities/types";
import type { LevelConfig } from "../levels/LevelConfig";
import { createId } from "../utils/id";
import { PrismSplitSystem } from "./PrismSplitSystem";

export type RaycastResult = {
  rays: Ray[];
  segments: RaySegment[];
  hitTargetIds: string[];
};

export class RaycastSystem {
  private readonly prismSplitSystem = new PrismSplitSystem();

  simulate(level: LevelConfig): RaycastResult {
    const initialRay: Ray = {
      id: createId("ray"),
      origin: level.lightSource.position,
      direction: level.lightSource.direction,
      color: level.lightSource.color,
      intensity: level.lightSource.intensity,
      hasSplit: false,
      splitHistory: [],
      sourceId: level.lightSource.id
    };

    const rays = level.prisms.length > 0 ? this.prismSplitSystem.split(initialRay, level.prisms[0]) : [initialRay];
    const segments = rays.map((ray) => ({
      id: createId("segment"),
      from: ray.origin,
      to: {
        x: ray.origin.x + ray.direction.x * 220,
        y: ray.origin.y + ray.direction.y * 220
      },
      color: ray.color,
      intensityStart: ray.intensity,
      intensityEnd: Math.max(0, ray.intensity - 0.25),
      sourceRayId: ray.id
    }));

    return {
      rays,
      segments,
      hitTargetIds: []
    };
  }
}

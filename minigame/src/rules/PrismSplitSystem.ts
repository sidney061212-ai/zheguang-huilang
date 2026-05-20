import type { Prism, Ray } from "../entities/types";
import { createId } from "../utils/id";

export class PrismSplitSystem {
  // v0.1 placeholder prototype only. This is intentionally not wired into
  // the playable raycast pipeline until prism gameplay is scheduled.
  split(ray: Ray, prism: Prism): Ray[] {
    if (!prism.enabled) return [ray];

    // Rule 1: only white rays can split.
    if (ray.color !== "white") return [ray];

    // Rule 2: the same ray can only split once per prismId.
    if (ray.splitHistory.includes(prism.id)) return [ray];

    // Rule 3 and 4: already split rays and colored rays cannot split again.
    if (ray.hasSplit) return [ray];

    const splitHistory = [...ray.splitHistory, prism.id];
    const baseRay = {
      origin: ray.origin,
      intensity: ray.intensity * 0.92,
      remainingDistance: ray.remainingDistance,
      depth: ray.depth + 1,
      hasSplit: true,
      splitHistory,
      sourceId: ray.id
    };

    // Rule 5: exactly three output rays, never 9 or more.
    return [
      {
        ...baseRay,
        id: createId("ray-red"),
        direction: { x: ray.direction.x, y: ray.direction.y - 0.18 },
        color: "red"
      },
      {
        ...baseRay,
        id: createId("ray-green"),
        direction: ray.direction,
        color: "green"
      },
      {
        ...baseRay,
        id: createId("ray-blue"),
        direction: { x: ray.direction.x, y: ray.direction.y + 0.18 },
        color: "blue"
      }
    ];
  }
}

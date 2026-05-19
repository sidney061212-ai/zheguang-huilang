import type { Mirror, Ray } from "../entities/types";
import { angleToDirection, reflect } from "../utils/math";

export class ReflectionSystem {
  reflectRay(ray: Ray, mirror: Mirror): Ray {
    const mirrorDirection = angleToDirection(mirror.rotation);
    const normal = { x: -mirrorDirection.y, y: mirrorDirection.x };
    return {
      ...ray,
      direction: reflect(ray.direction, normal)
    };
  }
}

import type { Mirror, Ray, RaySegment, Target, Vector2, Wall } from "../entities/types";
import type { LevelConfig } from "../levels/LevelConfig";
import { createId } from "../utils/id";
import {
  add,
  angleToDirection,
  distance,
  normalize,
  rayCircleIntersection,
  raySegmentIntersection,
  reflect,
  rotate,
  scale
} from "../utils/math";

export type RaycastResult = {
  rays: Ray[];
  segments: RaySegment[];
  hitTargetIds: string[];
  reason: "hit-target" | "blocked" | "distance-lost" | "max-bounces" | "no-source";
};

type Hit =
  | {
      type: "mirror";
      object: Mirror;
      point: Vector2;
      distance: number;
    }
  | {
      type: "wall";
      object: Wall;
      point: Vector2;
      distance: number;
    }
  | {
      type: "target";
      object: Target;
      point: Vector2;
      distance: number;
    };

const EPSILON = 0.08;

type ActiveRay = Ray & {
  visualOrigin: Vector2;
  visualRemainingDistance: number;
};

export class RaycastSystem {
  simulate(level: LevelConfig): RaycastResult {
    if (!level.lightSource.enabled) {
      return {
        rays: [],
        segments: [],
        hitTargetIds: [],
        reason: "no-source"
      };
    }

    const initialRay: ActiveRay = {
      id: createId("ray"),
      origin: { ...level.lightSource.position },
      direction: normalize(level.lightSource.direction),
      color: level.lightSource.color,
      intensity: level.lightSource.intensity,
      remainingDistance: level.maxDistance,
      depth: 0,
      hasSplit: false,
      splitHistory: [],
      sourceId: level.lightSource.id,
      visualOrigin: { ...level.lightSource.position },
      visualRemainingDistance: level.maxDistance
    };

    const rays: Ray[] = [initialRay];
    const segments: RaySegment[] = [];
    const hitTargetIds: string[] = [];
    let activeRay: ActiveRay | null = initialRay;
    let reason: RaycastResult["reason"] = "distance-lost";

    while (activeRay && activeRay.depth <= level.maxBounces) {
      if (activeRay.visualRemainingDistance <= 0) {
        reason = "distance-lost";
        break;
      }

      const hit = this.findNearestHit(level, activeRay);
      const originOffsetDistance = distance(activeRay.visualOrigin, activeRay.origin);
      const hitTravelDistance = hit ? originOffsetDistance + hit.distance : Number.POSITIVE_INFINITY;
      if (!hit || hitTravelDistance > activeRay.visualRemainingDistance) {
        const end = add(
          activeRay.visualOrigin,
          scale(activeRay.direction, activeRay.visualRemainingDistance)
        );
        segments.push(this.createSegment(activeRay, end, 0));
        reason = "distance-lost";
        break;
      }

      const remainingAfterHit: number = activeRay.visualRemainingDistance - hitTravelDistance;
      segments.push(this.createSegment(activeRay, hit.point, remainingAfterHit));

      if (hit.type === "target") {
        hitTargetIds.push(hit.object.id);
        reason = "hit-target";
        break;
      }

      if (hit.type === "wall") {
        reason = "blocked";
        break;
      }

      const mirror = hit.object;
      const reflectedDirection = this.reflectFromMirror(activeRay.direction, mirror);
      activeRay = {
        ...activeRay,
        id: createId("ray-reflected"),
        origin: add(hit.point, scale(reflectedDirection, EPSILON)),
        visualOrigin: hit.point,
        direction: reflectedDirection,
        remainingDistance: remainingAfterHit,
        visualRemainingDistance: remainingAfterHit,
        depth: activeRay.depth + 1
      };
      rays.push(activeRay);
    }

    if (activeRay && activeRay.depth > level.maxBounces) {
      reason = "max-bounces";
    }

    return { rays, segments, hitTargetIds, reason };
  }

  private findNearestHit(level: LevelConfig, ray: Ray): Hit | null {
    let nearest: Hit | null = null;
    const consider = (hit: Hit): void => {
      if (hit.distance <= EPSILON) return;
      if (!nearest || hit.distance < nearest.distance) nearest = hit;
    };

    for (const target of level.targets) {
      if (!target.acceptedColors.includes(ray.color)) continue;
      const hit = rayCircleIntersection(ray.origin, ray.direction, target.position, target.radius);
      if (hit) {
        consider({ type: "target", object: target, point: hit.point, distance: hit.distance });
      }
    }

    for (const wall of level.walls) {
      if (!wall.enabled) continue;
      for (const [a, b] of this.wallSegments(wall)) {
        const hit = raySegmentIntersection(ray.origin, ray.direction, a, b);
        if (hit) {
          consider({ type: "wall", object: wall, point: hit.point, distance: hit.distance });
        }
      }
    }

    for (const mirror of level.mirrors) {
      if (!mirror.enabled) continue;
      const [a, b] = this.mirrorEndpoints(mirror);
      const hit = raySegmentIntersection(ray.origin, ray.direction, a, b);
      if (hit) {
        consider({ type: "mirror", object: mirror, point: hit.point, distance: hit.distance });
      }
    }

    // v0.1 note: prism / concentrator are placeholders and intentionally
    // excluded from hit detection in the playable foundation branch.
    return nearest;
  }

  private createSegment(ray: ActiveRay, to: Vector2, remainingEnd: number): RaySegment {
    return {
      id: createId("segment"),
      from: { ...ray.visualOrigin },
      to,
      color: ray.color,
      intensityStart: ray.intensity,
      intensityEnd:
        ray.visualRemainingDistance <= 0
          ? 0
          : Math.max(0, ray.intensity * (remainingEnd / ray.visualRemainingDistance)),
      remainingStart: ray.visualRemainingDistance,
      remainingEnd,
      sourceRayId: ray.id
    };
  }

  private reflectFromMirror(direction: Vector2, mirror: Mirror): Vector2 {
    const mirrorDirection = angleToDirection(mirror.rotation);
    const normal = normalize({ x: -mirrorDirection.y, y: mirrorDirection.x });
    return reflect(direction, normal);
  }

  private mirrorEndpoints(mirror: Mirror): [Vector2, Vector2] {
    const half = mirror.length / 2;
    return [
      add(mirror.position, rotate({ x: -half, y: 0 }, mirror.rotation)),
      add(mirror.position, rotate({ x: half, y: 0 }, mirror.rotation))
    ];
  }

  private wallSegments(wall: Wall): Array<[Vector2, Vector2]> {
    const topLeft = wall.position;
    const topRight = { x: wall.position.x + wall.width, y: wall.position.y };
    const bottomRight = { x: wall.position.x + wall.width, y: wall.position.y + wall.height };
    const bottomLeft = { x: wall.position.x, y: wall.position.y + wall.height };
    return [
      [topLeft, topRight],
      [topRight, bottomRight],
      [bottomRight, bottomLeft],
      [bottomLeft, topLeft]
    ];
  }
}

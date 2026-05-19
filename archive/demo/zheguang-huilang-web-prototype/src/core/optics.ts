import {
  add,
  angleToDir,
  dist,
  mul,
  norm,
  rayCircleIntersection,
  raySegmentIntersection,
  reflect,
  rotate,
  sub,
  type Vec
} from "./math";
import type {
  Concentrator,
  Exit,
  LightColor,
  Level,
  Mirror,
  Obstacle,
  OpticalObject,
  Prism,
  Ray,
  RaySegment,
  SimulationResult
} from "./types";
const EPS = 0.08;
const MAX_EVENTS = 48;
const LIGHT_COLORS: Record<LightColor, string> = {
  white: "#7fd7ff",
  red: "#ff8b7b",
  green: "#8dffbc",
  blue: "#74b8ff"
};
type Hit =
  | {
      type: "mirror";
      object: Mirror;
      point: Vec;
      distance: number;
    }
  | {
      type: "obstacle";
      object: Obstacle;
      point: Vec;
      distance: number;
    }
  | {
      type: "concentrator";
      object: Concentrator;
      point: Vec;
      distance: number;
    }
  | {
      type: "exit";
      object: Exit;
      point: Vec;
      distance: number;
    }
  | {
      type: "prism";
      object: Prism;
      point: Vec;
      distance: number;
    };
export function mirrorEndpoints(m: Mirror): { a: Vec; b: Vec } {
  const half = m.length / 2;
  const localA = { x: -half, y: 0 };
  const localB = { x: half, y: 0 };
  return {
    a: add(m.pos, rotate(localA, m.angleDeg)),
    b: add(m.pos, rotate(localB, m.angleDeg))
  };
}
function obstacleSegments(o: Obstacle): Array<[Vec, Vec]> {
  const p1 = { x: o.x, y: o.y };
  const p2 = { x: o.x + o.w, y: o.y };
  const p3 = { x: o.x + o.w, y: o.y + o.h };
  const p4 = { x: o.x, y: o.y + o.h };
  return [
    [p1, p2],
    [p2, p3],
    [p3, p4],
    [p4, p1]
  ];
}
function findNearestHit(level: Level, ray: Ray): Hit | null {
  let nearest: Hit | null = null;
  function consider(hit: Hit) {
    if (hit.distance <= EPS) return;
    if (!nearest || hit.distance < nearest.distance) nearest = hit;
  }
  for (const ex of level.exits) {
    const hit = rayCircleIntersection(ray.origin, ray.dir, ex.pos, ex.radius);
    if (hit) {
      consider({
        type: "exit",
        object: ex,
        point: hit.point,
        distance: hit.t
      });
    }
  }
  for (const obj of level.objects) {
    if (obj.kind === "mirror") {
      const { a, b } = mirrorEndpoints(obj);
      const hit = raySegmentIntersection(ray.origin, ray.dir, a, b);
      if (hit) {
        consider({
          type: "mirror",
          object: obj,
          point: hit.point,
          distance: hit.t
        });
      }
    }
    if (obj.kind === "obstacle") {
      for (const [a, b] of obstacleSegments(obj)) {
        const hit = raySegmentIntersection(ray.origin, ray.dir, a, b);
        if (hit) {
          consider({
            type: "obstacle",
            object: obj,
            point: hit.point,
            distance: hit.t
          });
        }
      }
    }
    if (obj.kind === "concentrator") {
      if (ray.touchedBoosters.has(obj.id)) continue;
      const hit = rayCircleIntersection(ray.origin, ray.dir, obj.pos, obj.radius);
      if (hit) {
        consider({
          type: "concentrator",
          object: obj,
          point: hit.point,
          distance: hit.t
        });
      }
    }
    if (obj.kind === "prism") {
      if (ray.touchedPrisms.has(obj.id)) continue;
      const hit = rayCircleIntersection(ray.origin, ray.dir, obj.pos, obj.radius);
      if (hit) {
        consider({
          type: "prism",
          object: obj,
          point: hit.point,
          distance: hit.t
        });
      }
    }
  }
  return nearest;
}
export function simulateLight(level: Level): SimulationResult {
  const initialRay: Ray = {
    origin: level.source.pos,
    dir: angleToDir(level.source.angleDeg),
    remaining: level.source.maxDistance,
    color: "white",
    depth: 0,
    touchedBoosters: new Set(),
    hasPassedPrism: false,
    touchedPrisms: new Set()
  };
  const queue: Ray[] = [initialRay];
  const segments: RaySegment[] = [];
  const prismSplits: NonNullable<SimulationResult["debug"]>["prismSplits"] = [];
  let success = false;
  let hitExitId: string | undefined;
  let terminalReason: SimulationResult["reason"] = "missed";
  let events = 0;
  while (queue.length > 0 && events < MAX_EVENTS) {
    events += 1;
    const ray = queue.shift()!;
    if (ray.remaining <= 0) continue;
    const hit = findNearestHit(level, ray);
    if (!hit || hit.distance > ray.remaining) {
      const end = add(ray.origin, mul(norm(ray.dir), ray.remaining));
      segments.push({
        from: ray.origin,
        to: end,
        color: ray.color,
        remainingStart: ray.remaining,
        remainingEnd: 0
      });
      terminalReason = "distance_lost";
      continue;
    }
    const remainingAfterTravel = ray.remaining - hit.distance;
    segments.push({
      from: ray.origin,
      to: hit.point,
      color: ray.color,
      remainingStart: ray.remaining,
      remainingEnd: remainingAfterTravel
    });
    if (hit.type === "exit") {
      success = true;
      hitExitId = hit.object.id;
      terminalReason = "connected";
      break;
    }
    if (hit.type === "obstacle") {
      terminalReason = "blocked";
      continue;
    }
    if (hit.type === "concentrator") {
      const touched = new Set(ray.touchedBoosters);
      touched.add(hit.object.id);
      queue.push({
        origin: add(hit.point, mul(norm(ray.dir), EPS)),
        dir: ray.dir,
        remaining: remainingAfterTravel + hit.object.boostDistance,
        color: ray.color,
        depth: ray.depth + 1,
        touchedBoosters: touched,
        hasPassedPrism: ray.hasPassedPrism,
        splitFromPrismId: ray.splitFromPrismId,
        touchedPrisms: new Set(ray.touchedPrisms)
      });
      continue;
    }
    if (hit.type === "mirror") {
      const mirrorDir = angleToDir(hit.object.angleDeg);
      const normal = norm({ x: -mirrorDir.y, y: mirrorDir.x });
      const reflected = reflect(ray.dir, normal);
      queue.push({
        origin: add(hit.point, mul(reflected, EPS)),
        dir: reflected,
        remaining: remainingAfterTravel,
        color: ray.color,
        depth: ray.depth + 1,
        touchedBoosters: new Set(ray.touchedBoosters),
        hasPassedPrism: ray.hasPassedPrism,
        splitFromPrismId: ray.splitFromPrismId,
        touchedPrisms: new Set(ray.touchedPrisms)
      });
      continue;
    }
    if (hit.type === "prism") {
      // 第一版先做“可玩性分光”：基于入射方向生成三束。
      // 后续可以在这里替换为更真实的三棱镜折射 / 色散模型。
      const touchedPrisms = new Set(ray.touchedPrisms);
      touchedPrisms.add(hit.object.id);
      if (ray.depth > 8) continue;
      const baseAngle = Math.atan2(ray.dir.y, ray.dir.x);
      if (ray.color !== "white" || ray.hasPassedPrism) {
        queue.push({
          origin: add(hit.point, mul(norm(ray.dir), EPS)),
          dir: ray.dir,
          remaining: remainingAfterTravel,
          color: ray.color,
          depth: ray.depth + 1,
          touchedBoosters: new Set(ray.touchedBoosters),
          hasPassedPrism: true,
          splitFromPrismId: ray.splitFromPrismId,
          touchedPrisms
        });
        continue;
      }
      const angles = [-18, 0, 18];
      const colors: LightColor[] = ["red", "green", "blue"];
      prismSplits.push({
        prismId: hit.object.id,
        outputCount: colors.length,
        inputColor: ray.color
      });
      for (let i = 0; i < 3; i++) {
        const a = baseAngle + (angles[i] * Math.PI) / 180;
        queue.push({
          origin: add(hit.point, mul({ x: Math.cos(a), y: Math.sin(a) }, EPS)),
          dir: { x: Math.cos(a), y: Math.sin(a) },
          remaining: remainingAfterTravel * 0.92,
          color: colors[i],
          depth: ray.depth + 1,
          touchedBoosters: new Set(ray.touchedBoosters),
          hasPassedPrism: true,
          splitFromPrismId: hit.object.id,
          touchedPrisms: new Set(touchedPrisms)
        });
      }
    }
  }
  return {
    segments,
    success,
    hitExitId,
    reason: success ? "connected" : terminalReason,
    debug: {
      prismSplits
    }
  };
}
export function lightColorToCss(color: LightColor): string {
  return LIGHT_COLORS[color];
}
export function cloneLevel(level: Level): Level {
  return {
    ...level,
    source: {
      ...level.source,
      pos: { ...level.source.pos }
    },
    exits: level.exits.map((e) => ({
      ...e,
      pos: { ...e.pos }
    })),
    tools: { ...level.tools },
    objects: level.objects.map((o) => {
      if (o.kind === "mirror") {
        return {
          ...o,
          pos: { ...o.pos }
        };
      }
      if (o.kind === "concentrator") {
        return {
          ...o,
          pos: { ...o.pos }
        };
      }
      if (o.kind === "prism") {
        return {
          ...o,
          pos: { ...o.pos }
        };
      }
      return { ...o };
    })
  };
}
export function moveObject(obj: OpticalObject, pos: Vec) {
  if (obj.kind === "mirror" || obj.kind === "concentrator" || obj.kind === "prism") {
    obj.pos = pos;
  }
}
export function objectHitTest(obj: OpticalObject, p: Vec): boolean {
  if (obj.kind === "mirror") {
    const { a, b } = mirrorEndpoints(obj);
    const ap = sub(p, a);
    const ab = sub(b, a);
    const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / Math.max(1, ab.x * ab.x + ab.y * ab.y)));
    const closest = add(a, mul(ab, t));
    return dist(p, closest) <= 18;
  }
  if (obj.kind === "concentrator") {
    return dist(p, obj.pos) <= obj.radius + 12;
  }
  if (obj.kind === "prism") {
    return dist(p, obj.pos) <= obj.radius + 12;
  }
  if (obj.kind === "obstacle") {
    return p.x >= obj.x && p.x <= obj.x + obj.w && p.y >= obj.y && p.y <= obj.y + obj.h;
  }
  return false;
}

import { add, mul, rayCircleIntersection, raySegmentIntersection, rotate, type Vec } from "./Math2D";
import type { Mirror, Obstacle } from "./LevelTypes";

export function mirrorEndpoints(m: Mirror): { a: Vec; b: Vec } {
  const half = m.length / 2;
  const localA = { x: -half, y: 0 };
  const localB = { x: half, y: 0 };

  return {
    a: add(m.pos, rotate(localA, m.angleDeg)),
    b: add(m.pos, rotate(localB, m.angleDeg))
  };
}

export function obstacleSegments(o: Obstacle): Array<[Vec, Vec]> {
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

export { raySegmentIntersection, rayCircleIntersection, add, mul };

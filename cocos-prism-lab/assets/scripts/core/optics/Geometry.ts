import type { MirrorObject, ObstacleObject, Vec2 } from './types';
import { add, cross, dot, mul, norm, rotate, sub } from '../math/Vec2Math';

export type Segment = [Vec2, Vec2];
export type Intersection = { point: Vec2; t: number; u?: number };

export function mirrorEndpoints(m: MirrorObject): { a: Vec2; b: Vec2 } {
  const half = m.length / 2;
  return {
    a: add(m.pos, rotate({ x: -half, y: 0 }, m.angleDeg + 90)),
    b: add(m.pos, rotate({ x: half, y: 0 }, m.angleDeg + 90)),
  };
}

export function obstacleSegments(o: ObstacleObject): Segment[] {
  const p1 = { x: o.x, y: o.y };
  const p2 = { x: o.x + o.w, y: o.y };
  const p3 = { x: o.x + o.w, y: o.y + o.h };
  const p4 = { x: o.x, y: o.y + o.h };
  return [[p1, p2], [p2, p3], [p3, p4], [p4, p1]];
}

export function raySegmentIntersection(origin: Vec2, dir: Vec2, a: Vec2, b: Vec2): Intersection | null {
  const r = norm(dir);
  const s = sub(b, a);
  const denom = cross(r, s);
  if (Math.abs(denom) < 1e-8) return null;
  const qp = sub(a, origin);
  const t = cross(qp, s) / denom;
  const u = cross(qp, r) / denom;
  if (t > 1e-6 && u >= 0 && u <= 1) return { point: add(origin, mul(r, t)), t, u };
  return null;
}

export function rayCircleIntersection(origin: Vec2, dir: Vec2, center: Vec2, radius: number): Intersection | null {
  const d = norm(dir);
  const f = sub(origin, center);
  const a = dot(d, d);
  const b = 2 * dot(f, d);
  const c = dot(f, f) - radius * radius;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const sqrt = Math.sqrt(discriminant);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);
  const t = t1 > 1e-6 ? t1 : t2 > 1e-6 ? t2 : null;
  if (t == null) return null;
  return { point: add(origin, mul(d, t)), t };
}

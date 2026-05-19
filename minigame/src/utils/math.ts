import type { Vector2 } from "../entities/types";

export function vec(x: number, y: number): Vector2 {
  return { x, y };
}

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vector2, factor: number): Vector2 {
  return { x: v.x * factor, y: v.y * factor };
}

export function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function cross(a: Vector2, b: Vector2): number {
  return a.x * b.y - a.y * b.x;
}

export function length(v: Vector2): number {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vector2): Vector2 {
  const size = length(v);
  if (size < 1e-8) return { x: 1, y: 0 };
  return { x: v.x / size, y: v.y / size };
}

export function angleToDirection(radians: number): Vector2 {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function reflect(direction: Vector2, normal: Vector2): Vector2 {
  const d = normalize(direction);
  const n = normalize(normal);
  return normalize(sub(d, scale(n, 2 * dot(d, n))));
}

export function distance(a: Vector2, b: Vector2): number {
  return length(sub(a, b));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function rotate(point: Vector2, radians: number): Vector2 {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}

export function raySegmentIntersection(
  origin: Vector2,
  direction: Vector2,
  a: Vector2,
  b: Vector2
): { point: Vector2; distance: number; u: number } | null {
  const rayDirection = normalize(direction);
  const segment = sub(b, a);
  const denominator = cross(rayDirection, segment);
  if (Math.abs(denominator) < 1e-8) return null;
  const offset = sub(a, origin);
  const distanceAlongRay = cross(offset, segment) / denominator;
  const u = cross(offset, rayDirection) / denominator;
  if (distanceAlongRay <= 1e-6 || u < 0 || u > 1) return null;
  return {
    point: add(origin, scale(rayDirection, distanceAlongRay)),
    distance: distanceAlongRay,
    u
  };
}

export function rayCircleIntersection(
  origin: Vector2,
  direction: Vector2,
  center: Vector2,
  radius: number
): { point: Vector2; distance: number } | null {
  const rayDirection = normalize(direction);
  const fromCenter = sub(origin, center);
  const b = 2 * dot(fromCenter, rayDirection);
  const c = dot(fromCenter, fromCenter) - radius * radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  const t1 = (-b - root) / 2;
  const t2 = (-b + root) / 2;
  const distanceAlongRay = t1 > 1e-6 ? t1 : t2 > 1e-6 ? t2 : null;
  if (distanceAlongRay === null) return null;
  return {
    point: add(origin, scale(rayDirection, distanceAlongRay)),
    distance: distanceAlongRay
  };
}

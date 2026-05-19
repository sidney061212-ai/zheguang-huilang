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

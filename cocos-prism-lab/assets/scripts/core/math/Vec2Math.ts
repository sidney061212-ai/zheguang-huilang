import type { Vec2 } from '../optics/types';

export const EPS = 1e-7;

export function v(x: number, y: number): Vec2 { return { x, y }; }
export function add(a: Vec2, b: Vec2): Vec2 { return { x: a.x + b.x, y: a.y + b.y }; }
export function sub(a: Vec2, b: Vec2): Vec2 { return { x: a.x - b.x, y: a.y - b.y }; }
export function mul(a: Vec2, k: number): Vec2 { return { x: a.x * k, y: a.y * k }; }
export function dot(a: Vec2, b: Vec2): number { return a.x * b.x + a.y * b.y; }
export function cross(a: Vec2, b: Vec2): number { return a.x * b.y - a.y * b.x; }
export function len(a: Vec2): number { return Math.hypot(a.x, a.y); }
export function dist(a: Vec2, b: Vec2): number { return len(sub(a, b)); }
export function norm(a: Vec2): Vec2 {
  const l = len(a);
  if (l < EPS) return { x: 1, y: 0 };
  return { x: a.x / l, y: a.y / l };
}
export function clamp(n: number, min: number, max: number): number { return Math.max(min, Math.min(max, n)); }
export function degToRad(deg: number): number { return (deg * Math.PI) / 180; }
export function radToDeg(rad: number): number { return (rad * 180) / Math.PI; }
export function angleToDir(deg: number): Vec2 { const r = degToRad(deg); return { x: Math.cos(r), y: Math.sin(r) }; }
export function dirToAngleDeg(dir: Vec2): number { return radToDeg(Math.atan2(dir.y, dir.x)); }
export function rotate(p: Vec2, deg: number): Vec2 {
  const r = degToRad(deg), c = Math.cos(r), s = Math.sin(r);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}
export function reflect(dir: Vec2, normal: Vec2): Vec2 {
  const d = norm(dir), n = norm(normal);
  return norm(sub(d, mul(n, 2 * dot(d, n))));
}
export function approx(a: number, b: number, eps = 1e-4): boolean { return Math.abs(a - b) <= eps; }

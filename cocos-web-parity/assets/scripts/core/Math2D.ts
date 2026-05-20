export type Vec = {
  x: number;
  y: number;
};

export function v(x: number, y: number): Vec {
  return { x, y };
}

export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function mul(a: Vec, k: number): Vec {
  return { x: a.x * k, y: a.y * k };
}

export function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y;
}

export function cross(a: Vec, b: Vec): number {
  return a.x * b.y - a.y * b.x;
}

export function len(a: Vec): number {
  return Math.hypot(a.x, a.y);
}

export function norm(a: Vec): Vec {
  const l = len(a);
  if (l < 1e-9) {
    return { x: 1, y: 0 };
  }

  return { x: a.x / l, y: a.y / l };
}

export function dist(a: Vec, b: Vec): number {
  return len(sub(a, b));
}

export function angleToDir(deg: number): Vec {
  const r = (deg * Math.PI) / 180;
  return { x: Math.cos(r), y: Math.sin(r) };
}

export function dirToAngle(dir: Vec): number {
  return (Math.atan2(dir.y, dir.x) * 180) / Math.PI;
}

export function rotate(p: Vec, deg: number): Vec {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return {
    x: p.x * c - p.y * s,
    y: p.x * s + p.y * c
  };
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function reflect(dir: Vec, normal: Vec): Vec {
  const d = norm(dir);
  const n = norm(normal);
  return norm(sub(d, mul(n, 2 * dot(d, n))));
}

export function raySegmentIntersection(
  rayOrigin: Vec,
  rayDir: Vec,
  a: Vec,
  b: Vec
): { point: Vec; t: number; u: number } | null {
  const r = norm(rayDir);
  const s = sub(b, a);
  const denom = cross(r, s);
  if (Math.abs(denom) < 1e-8) {
    return null;
  }

  const qp = sub(a, rayOrigin);
  const t = cross(qp, s) / denom;
  const u = cross(qp, r) / denom;
  if (t > 1e-6 && u >= 0 && u <= 1) {
    return {
      point: add(rayOrigin, mul(r, t)),
      t,
      u
    };
  }

  return null;
}

export function rayCircleIntersection(
  origin: Vec,
  dir: Vec,
  center: Vec,
  radius: number
): { point: Vec; t: number } | null {
  const d = norm(dir);
  const f = sub(origin, center);
  const a = dot(d, d);
  const b = 2 * dot(f, d);
  const c = dot(f, f) - radius * radius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return null;
  }

  const sqrt = Math.sqrt(discriminant);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);
  const t = t1 > 1e-6 ? t1 : t2 > 1e-6 ? t2 : null;
  if (t == null) {
    return null;
  }

  return {
    point: add(origin, mul(d, t)),
    t
  };
}

export function pointInCircle(p: Vec, c: Vec, r: number): boolean {
  return dist(p, c) <= r;
}

export function pointNearSegment(p: Vec, a: Vec, b: Vec, threshold: number): boolean {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const t = clamp(dot(ap, ab) / Math.max(1e-9, dot(ab, ab)), 0, 1);
  const closest = add(a, mul(ab, t));
  return dist(p, closest) <= threshold;
}

import type { LevelConfig, LevelObject, LightColor, RayState, SimulationResult, Vec2 } from './types';
import { add, angleToDir, mul, norm, reflect } from '../math/Vec2Math';
import { mirrorEndpoints, obstacleSegments, rayCircleIntersection, raySegmentIntersection } from './Geometry';

const NUDGE = 0.35;
const MAX_EVENTS = 64;

type Hit = { type: 'exit' | 'mirror' | 'obstacle' | 'concentrator' | 'prism'; object: any; point: Vec2; distance: number };

function acceptsColor(accepts: LightColor[] | undefined, color: LightColor): boolean {
  return !accepts || accepts.includes(color) || accepts.includes('white');
}

function considerNearest(current: Hit | null, hit: Hit): Hit | null {
  if (hit.distance <= 1e-5) return current;
  return !current || hit.distance < current.distance ? hit : current;
}

function findNearestHit(level: LevelConfig, ray: RayState): Hit | null {
  let nearest: Hit | null = null;

  for (const exit of level.exits) {
    if (!acceptsColor(exit.accepts, ray.color)) continue;
    const hit = rayCircleIntersection(ray.origin, ray.dir, exit.pos, exit.radius);
    if (hit) nearest = considerNearest(nearest, { type: 'exit', object: exit, point: hit.point, distance: hit.t });
  }

  for (const obj of level.objects) {
    if (obj.kind === 'mirror') {
      const { a, b } = mirrorEndpoints(obj);
      const hit = raySegmentIntersection(ray.origin, ray.dir, a, b);
      if (hit) nearest = considerNearest(nearest, { type: 'mirror', object: obj, point: hit.point, distance: hit.t });
    } else if (obj.kind === 'obstacle') {
      for (const [a, b] of obstacleSegments(obj)) {
        const hit = raySegmentIntersection(ray.origin, ray.dir, a, b);
        if (hit) nearest = considerNearest(nearest, { type: 'obstacle', object: obj, point: hit.point, distance: hit.t });
      }
    } else if (obj.kind === 'fixedConcentrator' || obj.kind === 'portableConcentrator') {
      if (ray.touchedConcentrators.includes(obj.id)) continue;
      const hit = rayCircleIntersection(ray.origin, ray.dir, obj.pos, obj.radius);
      if (hit) nearest = considerNearest(nearest, { type: 'concentrator', object: obj, point: hit.point, distance: hit.t });
    } else if (obj.kind === 'prism' && obj.enabled) {
      if (ray.touchedPrisms.includes(obj.id)) continue;
      const hit = rayCircleIntersection(ray.origin, ray.dir, obj.pos, obj.radius);
      if (hit) nearest = considerNearest(nearest, { type: 'prism', object: obj, point: hit.point, distance: hit.t });
    }
  }

  return nearest;
}

function withPlacedObjects(level: LevelConfig): LevelConfig {
  return { ...level, objects: [...level.objects, ...level.solution.objects] };
}

export function simulateLevel(level: LevelConfig): SimulationResult {
  const queue: RayState[] = [{
    origin: level.source.pos,
    dir: angleToDir(level.source.angleDeg),
    remaining: level.source.maxDistance,
    color: 'white',
    depth: 0,
    touchedConcentrators: [],
    touchedPrisms: [],
  }];

  const segments: SimulationResult['segments'] = [];
  let reason: SimulationResult['reason'] = 'missed';
  let eventCount = 0;

  while (queue.length > 0 && eventCount < MAX_EVENTS) {
    eventCount += 1;
    const ray = queue.shift()!;
    if (ray.remaining <= 0) continue;

    const hit = findNearestHit(level, ray);
    if (!hit || hit.distance > ray.remaining) {
      const end = add(ray.origin, mul(norm(ray.dir), ray.remaining));
      segments.push({ from: ray.origin, to: end, color: ray.color, remainingStart: ray.remaining, remainingEnd: 0 });
      reason = 'distance_lost';
      continue;
    }

    const remainingAfterTravel = ray.remaining - hit.distance;
    segments.push({ from: ray.origin, to: hit.point, color: ray.color, remainingStart: ray.remaining, remainingEnd: remainingAfterTravel });

    if (hit.type === 'exit') return { success: true, hitExitId: hit.object.id, reason: 'connected', segments, eventCount };
    if (hit.type === 'obstacle') { reason = 'blocked'; continue; }

    if (hit.type === 'concentrator') {
      const dir = norm(ray.dir);
      queue.push({
        ...ray,
        origin: add(hit.point, mul(dir, NUDGE)),
        remaining: remainingAfterTravel + hit.object.boostDistance,
        depth: ray.depth + 1,
        touchedConcentrators: [...ray.touchedConcentrators, hit.object.id],
      });
      continue;
    }

    if (hit.type === 'mirror') {
      const normal = angleToDir(hit.object.angleDeg);
      const reflected = reflect(ray.dir, normal);
      queue.push({ ...ray, origin: add(hit.point, mul(reflected, NUDGE)), dir: reflected, remaining: remainingAfterTravel, depth: ray.depth + 1 });
      continue;
    }

    if (hit.type === 'prism') {
      const base = Math.atan2(ray.dir.y, ray.dir.x);
      const offsets = [-15, 0, 15];
      const colors: LightColor[] = ['red', 'green', 'blue'];
      for (let i = 0; i < 3; i++) {
        const a = base + offsets[i] * Math.PI / 180;
        const dir = { x: Math.cos(a), y: Math.sin(a) };
        queue.push({
          ...ray,
          origin: add(hit.point, mul(dir, NUDGE * 2)),
          dir,
          remaining: remainingAfterTravel * 0.94,
          color: colors[i],
          depth: ray.depth + 1,
          touchedPrisms: [...ray.touchedPrisms, hit.object.id],
        });
      }
    }
  }

  return { success: false, reason: eventCount >= MAX_EVENTS ? 'max_events' : reason, segments, eventCount };
}

export function validateSolution(level: LevelConfig): SimulationResult {
  return simulateLevel(withPlacedObjects(level));
}

export function simulateRuntime(level: LevelConfig, placed: LevelObject[]): SimulationResult {
  return simulateLevel({ ...level, objects: [...level.objects, ...placed], solution: { objects: [] } });
}

import { describe, expect, test } from 'vitest';
import type { LevelConfig } from '../assets/scripts/core/optics/types';
import { validateSolution } from '../assets/scripts/core/optics/LightSimulator';
import { validateAllLevels } from '../assets/scripts/debug/LevelSolutionValidator';

function baseLevel(overrides: Partial<LevelConfig>): LevelConfig {
  return {
    id: 'test-level',
    index: 1,
    name: 'test',
    hint: 'test',
    width: 390,
    height: 610,
    source: { id: 'source', pos: { x: 40, y: 300 }, angleDeg: 0, maxDistance: 500 },
    exits: [{ id: 'exit', pos: { x: 330, y: 300 }, radius: 18 }],
    tools: { mirror: 0, portableConcentrator: 0, prism: 0 },
    objects: [],
    solution: { objects: [] },
    ...overrides,
  };
}

describe('optics simulation', () => {
  test('mirror reflection redirects beam to exit', () => {
    const level = baseLevel({
      source: { id: 'source', pos: { x: 40, y: 120 }, angleDeg: 90, maxDistance: 600 },
      exits: [{ id: 'exit', pos: { x: 240, y: 320 }, radius: 20 }],
      tools: { mirror: 1, portableConcentrator: 0, prism: 0 },
      solution: {
        objects: [
          { id: 'm1', kind: 'mirror', pos: { x: 40, y: 320 }, angleDeg: 135, length: 120, movable: true },
        ],
      },
    });

    const result = validateSolution(level);
    expect(result.success).toBe(true);
    expect(result.reason).toBe('connected');
  });

  test('obstacle blocks a direct beam', () => {
    const level = baseLevel({
      source: { id: 'source', pos: { x: 60, y: 300 }, angleDeg: 0, maxDistance: 400 },
      exits: [{ id: 'exit', pos: { x: 330, y: 300 }, radius: 18 }],
      objects: [{ id: 'wall', kind: 'obstacle', x: 140, y: 250, w: 60, h: 100 }],
    });

    const result = validateSolution(level);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('blocked');
  });

  test('concentrator adds range so beam can reach the exit', () => {
    const level = baseLevel({
      source: { id: 'source', pos: { x: 60, y: 300 }, angleDeg: 0, maxDistance: 120 },
      exits: [{ id: 'exit', pos: { x: 320, y: 300 }, radius: 18 }],
      objects: [
        { id: 'boost', kind: 'fixedConcentrator', pos: { x: 140, y: 300 }, radius: 18, boostDistance: 220, movable: false },
      ],
    });

    const result = validateSolution(level);
    expect(result.success).toBe(true);
    expect(result.reason).toBe('connected');
  });

  test('prism splits white light and allows color-selective exit hit', () => {
    const level = baseLevel({
      source: { id: 'source', pos: { x: 60, y: 300 }, angleDeg: 0, maxDistance: 500 },
      exits: [{ id: 'exit-blue', pos: { x: 250, y: 350 }, radius: 26, accepts: ['blue'] }],
      solution: {
        objects: [
          { id: 'prism-1', kind: 'prism', pos: { x: 140, y: 300 }, radius: 18, angleDeg: 0, movable: true, enabled: true },
        ],
      },
    });

    const result = validateSolution(level);
    expect(result.success).toBe(true);
    expect(result.hitExitId).toBe('exit-blue');
    expect(result.segments.some((seg) => seg.color === 'blue')).toBe(true);
  });
});

describe('level validator', () => {
  test('validateAllLevels passes all 10 levels', () => {
    expect(validateAllLevels()).toBe(true);
  });
});

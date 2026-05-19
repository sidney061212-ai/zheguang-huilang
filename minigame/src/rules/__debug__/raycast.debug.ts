import type { LevelConfig } from "../../levels/LevelConfig";
import { RaycastSystem } from "../RaycastSystem";

const EPSILON = 1e-4;

type DebugCase = {
  name: string;
  run: () => void;
};

function makeLevel(overrides: Partial<LevelConfig>): LevelConfig {
  return {
    id: "debug-raycast",
    name: "Debug Raycast",
    hint: "",
    maxDistance: 600,
    maxBounces: 8,
    lightSource: {
      id: "source-debug",
      position: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
      color: "white",
      intensity: 1,
      enabled: true
    },
    mirrors: [],
    prisms: [],
    targets: [],
    walls: [],
    acceptance: {
      expectedConcept: "debug",
      hasDeterministicSolution: true
    },
    ...overrides
  };
}

function simulate(level: LevelConfig) {
  return new RaycastSystem().simulate(level);
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

function assertClose(actual: number, expected: number, message: string): void {
  if (Math.abs(actual - expected) > EPSILON) {
    throw new Error(`${message}: expected ${expected}, received ${actual}`);
  }
}

function assertPoint(actual: { x: number; y: number }, expected: { x: number; y: number }, message: string): void {
  assertClose(actual.x, expected.x, `${message}.x`);
  assertClose(actual.y, expected.y, `${message}.y`);
}

function segmentLength(segment: { from: { x: number; y: number }; to: { x: number; y: number } }): number {
  return Math.hypot(segment.to.x - segment.from.x, segment.to.y - segment.from.y);
}

const cases: DebugCase[] = [
  {
    name: "direct target hit",
    run: () => {
      const result = simulate(
        makeLevel({
          targets: [
            {
              id: "target-direct",
              position: { x: 120, y: 0 },
              radius: 10,
              acceptedColors: ["white"],
              hit: false
            }
          ]
        })
      );

      assertEqual(result.segments.length, 1, "direct hit emits one segment");
      assert(result.hitTargetIds.includes("target-direct"), "direct target is hit");
      assertPoint(result.segments[0].to, { x: 110, y: 0 }, "direct hit stops at target edge");
    }
  },
  {
    name: "distance lost",
    run: () => {
      const result = simulate(
        makeLevel({
          lightSource: {
            id: "source-low-intensity",
            position: { x: 0, y: 0 },
            direction: { x: 1, y: 0 },
            color: "white",
            intensity: 1,
            enabled: true
          },
          maxDistance: 120,
          targets: [
            {
              id: "target-too-far",
              position: { x: 160, y: 0 },
              radius: 10,
              acceptedColors: ["white"],
              hit: false
            }
          ]
        })
      );

      assertEqual(result.hitTargetIds.length, 0, "far target is not hit");
      assertEqual(result.segments.length, 1, "lost ray emits one terminal segment");
      assertPoint(result.segments[0].to, { x: 120, y: 0 }, "lost ray ends at remaining distance");
      assertClose(result.segments[0].intensityEnd, 0, "lost ray spends all intensity");
    }
  },
  {
    name: "wall block",
    run: () => {
      const result = simulate(
        makeLevel({
          targets: [
            {
              id: "target-behind-wall",
              position: { x: 140, y: 0 },
              radius: 10,
              acceptedColors: ["white"],
              hit: false
            }
          ],
          walls: [
            {
              id: "wall-block",
              position: { x: 80, y: -20 },
              width: 20,
              height: 40,
              enabled: true
            }
          ]
        })
      );

      assertEqual(result.hitTargetIds.length, 0, "wall blocks target");
      assertEqual(result.segments.length, 1, "wall block emits one segment");
      assertPoint(result.segments[0].to, { x: 80, y: 0 }, "ray stops at wall edge");
    }
  },
  {
    name: "mirror reflection",
    run: () => {
      const result = simulate(
        makeLevel({
          mirrors: [
            {
              id: "mirror-turn-down",
              position: { x: 100, y: 0 },
              rotation: Math.PI / 4,
              length: 80,
              enabled: true,
              movable: true
            }
          ],
          targets: [
            {
              id: "target-reflected",
              position: { x: 100, y: 120 },
              radius: 10,
              acceptedColors: ["white"],
              hit: false
            }
          ]
        })
      );

      assert(result.hitTargetIds.includes("target-reflected"), "reflected target is hit");
      assertEqual(result.segments.length, 2, "reflection emits incoming and reflected segments");
      assertPoint(result.segments[0].to, { x: 100, y: 0 }, "incoming segment stops at mirror");
      assertPoint(result.segments[1].to, { x: 100, y: 110 }, "reflected segment stops at target edge");
    }
  },
  {
    name: "nearest hit selection",
    run: () => {
      const result = simulate(
        makeLevel({
          mirrors: [
            {
              id: "mirror-nearest",
              position: { x: 80, y: 0 },
              rotation: Math.PI / 4,
              length: 80,
              enabled: true,
              movable: true
            }
          ],
          targets: [
            {
              id: "target-behind-mirror",
              position: { x: 140, y: 0 },
              radius: 10,
              acceptedColors: ["white"],
              hit: false
            },
            {
              id: "target-after-nearest-mirror",
              position: { x: 80, y: 100 },
              radius: 10,
              acceptedColors: ["white"],
              hit: false
            }
          ]
        })
      );

      assert(result.hitTargetIds.includes("target-after-nearest-mirror"), "nearest mirror redirects the ray");
      assert(!result.hitTargetIds.includes("target-behind-mirror"), "farther direct target is not selected first");
      assertPoint(result.segments[0].to, { x: 80, y: 0 }, "first segment stops at nearest mirror");
    }
  },
  {
    name: "remaining distance after reflection",
    run: () => {
      const result = simulate(
        makeLevel({
          lightSource: {
            id: "source-limited-reflection",
            position: { x: 0, y: 0 },
            direction: { x: 1, y: 0 },
            color: "white",
            intensity: 1,
            enabled: true
          },
          maxDistance: 120,
          mirrors: [
            {
              id: "mirror-spend-distance",
              position: { x: 80, y: 0 },
              rotation: Math.PI / 4,
              length: 80,
              enabled: true,
              movable: true
            }
          ],
          targets: [
            {
              id: "target-after-spent-distance",
              position: { x: 80, y: 80 },
              radius: 10,
              acceptedColors: ["white"],
              hit: false
            }
          ]
        })
      );

      assertEqual(result.hitTargetIds.length, 0, "reflection does not reset travel distance");
      assertEqual(result.segments.length, 2, "limited reflected ray emits two segments");
      assertClose(segmentLength(result.segments[0]), 80, "incoming segment spends distance");
      assertClose(segmentLength(result.segments[1]), 40, "reflected segment only has remaining distance");
      assertPoint(result.segments[1].to, { x: 80, y: 40 }, "reflected ray stops when remaining distance is spent");
    }
  }
];

for (const debugCase of cases) {
  debugCase.run();
  console.log(`ok - ${debugCase.name}`);
}

console.log(`raycast debug: ${cases.length}/${cases.length} passed`);

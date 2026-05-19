import type { LevelConfig } from "./LevelConfig";

export const level001: LevelConfig = {
  id: "level-001",
  name: "第一关：反射教学",
  hint: "拖动或旋转镜子，让光线折向上方目标。",
  maxDistance: 420,
  maxBounces: 4,
  lightSource: {
    id: "source-001",
    position: { x: 48, y: 360 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [
    {
      id: "mirror-001",
      position: { x: 180, y: 360 },
      rotation: -Math.PI / 4,
      length: 90,
      enabled: true,
      movable: true
    }
  ],
  prisms: [],
  targets: [
    {
      id: "target-001",
      position: { x: 180, y: 220 },
      radius: 22,
      acceptedColors: ["white"],
      hit: false
    }
  ],
  walls: [],
  acceptance: {
    expectedConcept: "普通镜子反射",
    hasDeterministicSolution: true
  }
};

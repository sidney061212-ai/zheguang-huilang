import type { LevelConfig } from "./LevelConfig";

export const level003: LevelConfig = {
  id: "level-003",
  name: "第三关：差一点",
  hint: "光程有限，过长路线会耗尽；找到更短的反射路径。",
  maxDistance: 430,
  maxBounces: 5,
  lightSource: {
    id: "source-003",
    position: { x: 48, y: 430 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [
    {
      id: "mirror-003",
      position: { x: 210, y: 430 },
      rotation: -Math.PI / 4,
      length: 90,
      enabled: true,
      movable: true
    }
  ],
  prisms: [],
  targets: [
    {
      id: "target-003",
      position: { x: 210, y: 235 },
      radius: 22,
      acceptedColors: ["white"],
      hit: false
    }
  ],
  walls: [
    {
      id: "wall-001",
      position: { x: 120, y: 240 },
      width: 52,
      height: 130,
      enabled: true
    }
  ],
  acceptance: {
    expectedConcept: "光程按实际路径长度衰减",
    hasDeterministicSolution: true
  }
};

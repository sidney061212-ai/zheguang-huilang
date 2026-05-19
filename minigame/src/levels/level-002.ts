import type { LevelConfig } from "./LevelConfig";

export const level002: LevelConfig = {
  id: "level-002",
  name: "第二关：镜面反射",
  hint: "旋转镜子，让光线转向目标。",
  lightSource: {
    id: "source-002",
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
      rotation: -0.75,
      length: 90,
      enabled: true,
      movable: true
    }
  ],
  prisms: [],
  targets: [
    {
      id: "target-002",
      position: { x: 305, y: 220 },
      radius: 22,
      acceptedColors: ["white", "red", "green", "blue"],
      hit: false
    }
  ],
  walls: [],
  acceptance: {
    expectedConcept: "镜子反射",
    hasDeterministicSolution: true
  }
};

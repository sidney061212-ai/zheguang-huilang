import type { LevelConfig } from "./LevelConfig";

export const level001: LevelConfig = {
  id: "level-001",
  name: "第一关：直达",
  hint: "白光沿直线前进，目标在光路正前方。",
  maxDistance: 420,
  maxBounces: 4,
  lightSource: {
    id: "source-001",
    position: { x: 48, y: 260 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [],
  prisms: [],
  targets: [
    {
      id: "target-001",
      position: { x: 260, y: 260 },
      radius: 22,
      acceptedColors: ["white"],
      hit: false
    }
  ],
  walls: [],
  acceptance: {
    expectedConcept: "直射目标",
    hasDeterministicSolution: true
  }
};

import type { LevelConfig } from "./LevelConfig";

export const level001: LevelConfig = {
  id: "level-001",
  name: "第一关：直达",
  hint: "观察白光如何命中目标点。",
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
      position: { x: 300, y: 260 },
      radius: 22,
      acceptedColors: ["white", "red", "green", "blue"],
      hit: false
    }
  ],
  walls: [],
  acceptance: {
    expectedConcept: "直射目标",
    hasDeterministicSolution: true
  }
};

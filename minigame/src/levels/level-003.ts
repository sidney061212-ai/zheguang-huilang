import type { LevelConfig } from "./LevelConfig";

export const level003: LevelConfig = {
  id: "level-003",
  name: "第三关：三棱镜",
  hint: "白光进入三棱镜后只会分裂成三条彩色光。",
  lightSource: {
    id: "source-003",
    position: { x: 48, y: 300 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [],
  prisms: [
    {
      id: "prism-001",
      position: { x: 170, y: 300 },
      rotation: 0,
      size: 34,
      enabled: true
    }
  ],
  targets: [
    {
      id: "target-003",
      position: { x: 320, y: 300 },
      radius: 22,
      acceptedColors: ["red", "green", "blue"],
      hit: false
    }
  ],
  walls: [],
  acceptance: {
    expectedConcept: "三棱镜分光",
    hasDeterministicSolution: true
  }
};

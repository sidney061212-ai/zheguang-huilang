import type { LevelConfig } from "./LevelConfig";

export const level003: LevelConfig = {
  id: "level-003",
  name: "第三关：避开墙体",
  hint: "直线被墙挡住，镜子把光线折向上方目标。",
  maxDistance: 560,
  maxBounces: 5,
  lightSource: {
    id: "source-003",
    position: { x: 48, y: 300 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [
    {
      id: "mirror-003",
      position: { x: 170, y: 300 },
      rotation: -Math.PI / 4,
      length: 84,
      enabled: true,
      movable: true
    }
  ],
  prisms: [],
  targets: [
    {
      id: "target-003",
      position: { x: 170, y: 160 },
      radius: 22,
      acceptedColors: ["white"],
      hit: false
    }
  ],
  walls: [
    {
      id: "wall-001",
      position: { x: 260, y: 300 },
      width: 44,
      height: 160,
      enabled: true
    }
  ],
  acceptance: {
    expectedConcept: "用镜子绕过墙体",
    hasDeterministicSolution: true
  }
};

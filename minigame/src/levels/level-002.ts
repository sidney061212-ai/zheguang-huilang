import type { LevelConfig } from "./LevelConfig";

export const level002: LevelConfig = {
  id: "level-002",
  name: "第二关：绕开障碍",
  hint: "直线被墙挡住，先用镜子把光折到上方再命中目标。",
  maxDistance: 560,
  maxBounces: 5,
  lightSource: {
    id: "source-002",
    position: { x: 48, y: 300 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [
    {
      id: "mirror-002",
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
      id: "target-002",
      position: { x: 170, y: 160 },
      radius: 22,
      acceptedColors: ["white"],
      hit: false
    }
  ],
  walls: [
    {
      id: "wall-002",
      position: { x: 250, y: 270 },
      width: 48,
      height: 170,
      enabled: true
    }
  ],
  acceptance: {
    expectedConcept: "用镜子绕过墙体",
    hasDeterministicSolution: true
  }
};

import type { LevelConfig } from "./LevelConfig";

export const level004: LevelConfig = {
  id: "level-004",
  name: "第四关：折返",
  hint: "两面镜子把光线折成 U 形，避开中间墙体后抵达目标。",
  maxDistance: 620,
  maxBounces: 6,
  lightSource: {
    id: "source-004",
    position: { x: 48, y: 340 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [
    {
      id: "mirror-004-a",
      position: { x: 150, y: 340 },
      rotation: -Math.PI / 4,
      length: 86,
      enabled: true,
      movable: true
    },
    {
      id: "mirror-004-b",
      position: { x: 150, y: 200 },
      rotation: -Math.PI / 4,
      length: 86,
      enabled: true,
      movable: true
    }
  ],
  prisms: [],
  targets: [
    {
      id: "target-004",
      position: { x: 320, y: 200 },
      radius: 22,
      acceptedColors: ["white"],
      hit: false
    }
  ],
  walls: [
    {
      id: "wall-004",
      position: { x: 236, y: 270 },
      width: 48,
      height: 180,
      enabled: true
    }
  ],
  acceptance: {
    expectedConcept: "连续两次反射绕过障碍",
    hasDeterministicSolution: true
  }
};

import type { LevelConfig } from "./LevelConfig";

export const level005: LevelConfig = {
  id: "level-005",
  name: "第五关：长廊",
  hint: "三面镜子把光线送过狭窄通道，墙体限制直达路线。",
  maxDistance: 760,
  maxBounces: 8,
  lightSource: {
    id: "source-005",
    position: { x: 48, y: 380 },
    direction: { x: 1, y: 0 },
    color: "white",
    intensity: 1,
    enabled: true
  },
  mirrors: [
    {
      id: "mirror-005-a",
      position: { x: 130, y: 380 },
      rotation: -Math.PI / 4,
      length: 78,
      enabled: true,
      movable: true
    },
    {
      id: "mirror-005-b",
      position: { x: 130, y: 180 },
      rotation: -Math.PI / 4,
      length: 78,
      enabled: true,
      movable: true
    },
    {
      id: "mirror-005-c",
      position: { x: 260, y: 180 },
      rotation: Math.PI / 4,
      length: 78,
      enabled: true,
      movable: true
    }
  ],
  prisms: [],
  targets: [
    {
      id: "target-005",
      position: { x: 260, y: 360 },
      radius: 22,
      acceptedColors: ["white"],
      hit: false
    }
  ],
  walls: [
    {
      id: "wall-005-a",
      position: { x: 198, y: 292 },
      width: 44,
      height: 216,
      enabled: true
    },
    {
      id: "wall-005-b",
      position: { x: 308, y: 260 },
      width: 44,
      height: 160,
      enabled: true
    }
  ],
  acceptance: {
    expectedConcept: "多镜连续反射与墙体约束",
    hasDeterministicSolution: true
  }
};

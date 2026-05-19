import type { Level } from "./core/types";
export const LOGICAL_WIDTH = 390;
export const LOGICAL_HEIGHT = 760;
export const levels: Level[] = [
  {
    id: "level-001",
    name: "第 1 关：错位的光",
    hint: "拖出一面镜子，旋转它，让光线折向出口。",
    source: {
      pos: { x: 48, y: 470 },
      angleDeg: 0,
      maxDistance: 520
    },
    exits: [{ id: "exit", pos: { x: 340, y: 265 }, radius: 22 }],
    tools: {
      mirror: 1,
      portableConcentrator: 0,
      prism: 0
    },
    objects: []
  },
  {
    id: "level-002",
    name: "第 2 关：绕开障碍",
    hint: "直线被挡住了，试着用镜子绕一下。",
    source: {
      pos: { x: 48, y: 420 },
      angleDeg: 0,
      maxDistance: 620
    },
    exits: [{ id: "exit", pos: { x: 342, y: 300 }, radius: 22 }],
    tools: {
      mirror: 2,
      portableConcentrator: 0,
      prism: 0
    },
    objects: [
      { id: "block-1", kind: "obstacle", x: 150, y: 350, w: 95, h: 90 }
    ]
  },
  {
    id: "level-003",
    name: "第 3 关：差一点",
    hint: "路线对了也可能不够远，光程会按真实距离消耗。",
    source: {
      pos: { x: 48, y: 560 },
      angleDeg: 0,
      maxDistance: 450
    },
    exits: [{ id: "exit", pos: { x: 340, y: 190 }, radius: 22 }],
    tools: {
      mirror: 2,
      portableConcentrator: 0,
      prism: 0
    },
    objects: [
      { id: "block-1", kind: "obstacle", x: 170, y: 345, w: 70, h: 110 }
    ]
  },
  {
    id: "level-004",
    name: "第 4 关：聚光点",
    hint: "光程不够时，先让光经过固定聚光点。",
    source: {
      pos: { x: 48, y: 560 },
      angleDeg: 0,
      maxDistance: 390
    },
    exits: [{ id: "exit", pos: { x: 340, y: 205 }, radius: 22 }],
    tools: {
      mirror: 2,
      portableConcentrator: 0,
      prism: 0
    },
    objects: [
      { id: "block-1", kind: "obstacle", x: 155, y: 385, w: 90, h: 80 },
      {
        id: "boost-1",
        kind: "concentrator",
        pos: { x: 300, y: 430 },
        radius: 24,
        boostDistance: 280,
        movable: false
      }
    ]
  },
  {
    id: "level-005",
    name: "第 5 关：便携聚光器",
    hint: "这次你可以自己放一个聚光器，给光续一段距离。",
    source: {
      pos: { x: 48, y: 520 },
      angleDeg: 0,
      maxDistance: 360
    },
    exits: [{ id: "exit", pos: { x: 340, y: 210 }, radius: 22 }],
    tools: {
      mirror: 2,
      portableConcentrator: 1,
      prism: 0
    },
    objects: [
      { id: "block-1", kind: "obstacle", x: 155, y: 340, w: 90, h: 115 }
    ]
  },
  {
    id: "level-006",
    name: "第 6 关：三棱镜雏形",
    hint: "三棱镜会把光分成三束，任意一束进入出口即可。",
    source: {
      pos: { x: 48, y: 430 },
      angleDeg: 0,
      maxDistance: 520
    },
    exits: [{ id: "exit", pos: { x: 342, y: 245 }, radius: 22 }],
    tools: {
      mirror: 1,
      portableConcentrator: 0,
      prism: 1
    },
    objects: [
      { id: "block-1", kind: "obstacle", x: 180, y: 380, w: 60, h: 95 }
    ]
  }
];

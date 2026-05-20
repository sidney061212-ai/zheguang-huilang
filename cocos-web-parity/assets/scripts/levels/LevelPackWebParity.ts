import type { Level } from "../core/LevelTypes";

export const LOGICAL_WIDTH = 390;
export const LOGICAL_HEIGHT = 610;

export const LevelPackWebParity: Level[] = [
  {
    id: "level-001",
    name: "错位折射",
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
    name: "跨越黑障",
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
    objects: [{ id: "block-1", kind: "obstacle", x: 150, y: 350, w: 95, h: 90 }]
  },
  {
    id: "level-003",
    name: "续航缺口",
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
    objects: [{ id: "block-1", kind: "obstacle", x: 170, y: 345, w: 70, h: 110 }]
  },
  {
    id: "level-004",
    name: "量子充能井",
    hint: "光程不够时，先让光经过固定充能井。",
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
    name: "随身背包充能",
    hint: "这次你可以自己放一个充能器，给光续一段距离。",
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
    objects: [{ id: "block-1", kind: "obstacle", x: 155, y: 340, w: 90, h: 115 }]
  },
  {
    id: "level-006",
    name: "分光三棱镜",
    hint: "三棱镜会把白光分成三束，任意一束进入出口即可。",
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
    objects: [{ id: "block-1", kind: "obstacle", x: 180, y: 380, w: 60, h: 95 }]
  }
];

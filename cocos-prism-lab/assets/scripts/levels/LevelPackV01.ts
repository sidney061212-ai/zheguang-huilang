import type { LevelConfig } from '../core/optics/types';

const W = 390;
const H = 610;
const mirror = (id: string, x: number, y: number, angleDeg: number, length = 86) => ({ id, kind: 'mirror' as const, pos: { x, y }, angleDeg, length, movable: true });
const booster = (id: string, x: number, y: number, boostDistance = 260, movable = true) => ({ id, kind: movable ? 'portableConcentrator' as const : 'fixedConcentrator' as const, pos: { x, y }, radius: 18, boostDistance, movable });

export const LevelPackV01: LevelConfig[] = [
  {
    id: 'level-001', index: 1, name: '错位折射', hint: '一块镜子，把低位光线反射到高位出口。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 430 }, angleDeg: 0, maxDistance: 560 },
    exits: [{ id: 'exit', pos: { x: 332, y: 218 }, radius: 20 }],
    tools: { mirror: 1, portableConcentrator: 0, prism: 0 }, objects: [],
    solution: { objects: [mirror('s-m1', 190, 430, 63)] }
  },
  {
    id: 'level-002', index: 2, name: '跨越黑障', hint: '绕开中间黑障，两块镜子完成折返。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 430 }, angleDeg: 0, maxDistance: 700 },
    exits: [{ id: 'exit', pos: { x: 332, y: 238 }, radius: 20 }],
    tools: { mirror: 2, portableConcentrator: 0, prism: 0 },
    objects: [{ id: 'block-1', kind: 'obstacle', x: 150, y: 335, w: 95, h: 120 }],
    solution: { objects: [mirror('s-m1', 61.90346639938165, 445.95553461928085, 48.08446592679657), mirror('s-m2', 112.02807834598032, 278.8091604751421, 40.79485368865801)] }
  },
  {
    id: 'level-003', index: 3, name: '续航缺口', hint: '光程不够，利用固定聚光点续航。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 480 }, angleDeg: 0, maxDistance: 300 },
    exits: [{ id: 'exit', pos: { x: 332, y: 172 }, radius: 20 }],
    tools: { mirror: 2, portableConcentrator: 0, prism: 0 },
    objects: [booster('fixed-b1', 300, 360, 320, false), { id: 'block-1', kind: 'obstacle', x: 145, y: 300, w: 80, h: 105 }],
    solution: { objects: [mirror('s-m1', 114.22037685804898, 488.3438971280589, 74.2172218278929), mirror('s-m2', 332.5440579777246, 346.07615752378376, 32.19712322155132)] }
  },
  {
    id: 'level-004', index: 4, name: '随身聚光', hint: '自己部署一个聚光器，补上最后一段距离。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 455 }, angleDeg: 0, maxDistance: 330 },
    exits: [{ id: 'exit', pos: { x: 332, y: 190 }, radius: 20 }],
    tools: { mirror: 2, portableConcentrator: 1, prism: 0 }, objects: [{ id: 'block-1', kind: 'obstacle', x: 155, y: 295, w: 85, h: 120 }],
    solution: { objects: [mirror('s-m1', 88.71717473388883, 213.14221915957964, 100.72925177962459), booster('s-b1', 286.0016324556656, 370.3526859740376, 237.83478840094074, true), mirror('s-m2', 286.6329556516439, 454.47225724155334, 50.55685430916108)] }
  },
  {
    id: 'level-005', index: 5, name: '窄门偏折', hint: '出口位置很刁钻，需要更精确的镜面角度。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 500 }, angleDeg: 0, maxDistance: 720 },
    exits: [{ id: 'exit', pos: { x: 330, y: 112 }, radius: 18 }],
    tools: { mirror: 2, portableConcentrator: 0, prism: 0 },
    objects: [{ id: 'block-1', kind: 'obstacle', x: 135, y: 330, w: 115, h: 115 }, { id: 'block-2', kind: 'obstacle', x: 240, y: 155, w: 48, h: 125 }],
    solution: { objects: [mirror('s-m1', 299.07221953771864, 481.7450446077561, 48.306440165126205), mirror('s-m2', 148.27629602607522, 291.3803092195144, 50.767562570966305)] }
  },
  {
    id: 'level-006', index: 6, name: '三段回廊', hint: '三次折射，像搭桥一样避开障碍。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 470 }, angleDeg: 0, maxDistance: 840 },
    exits: [{ id: 'exit', pos: { x: 335, y: 235 }, radius: 20 }],
    tools: { mirror: 3, portableConcentrator: 0, prism: 0 },
    objects: [{ id: 'block-1', kind: 'obstacle', x: 140, y: 360, w: 85, h: 130 }, { id: 'block-2', kind: 'obstacle', x: 210, y: 210, w: 70, h: 110 }],
    solution: { objects: [mirror('s-m1', 332.04488568474625, 483.4545482718288, 30.480756119241917), mirror('s-m2', 199.49580396200264, 126.40418210089645, 78.28927517943056), mirror('s-m3', 91.01902224031134, 449.81850273125326, 56.638231989796715)] }
  },
  {
    id: 'level-007', index: 7, name: '能量陷阱', hint: '路线越短越好，绕远会耗尽。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 385 }, angleDeg: 0, maxDistance: 390 },
    exits: [{ id: 'exit', pos: { x: 332, y: 150 }, radius: 19 }],
    tools: { mirror: 2, portableConcentrator: 1, prism: 0 },
    objects: [{ id: 'block-1', kind: 'obstacle', x: 155, y: 250, w: 92, h: 150 }],
    solution: { objects: [mirror('s-m1', 135.20092259362713, 382.96608877500717, 46.98993949177136), booster('s-b1', 78.45124933879995, 368.7831787761818, 359.9418824829737, true), mirror('s-m2', 176.5853991147036, 149.19302315401967, 45.14236074493522)] }
  },
  {
    id: 'level-008', index: 8, name: '棱镜试验', hint: '三棱镜是趣味占位道具，只要任意一束命中即可。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 365 }, angleDeg: 0, maxDistance: 560 },
    exits: [{ id: 'exit', pos: { x: 330, y: 210 }, radius: 22 }],
    tools: { mirror: 1, portableConcentrator: 0, prism: 1 },
    objects: [{ id: 'block-1', kind: 'obstacle', x: 180, y: 300, w: 60, h: 110 }],
    solution: { objects: [{ id: 's-prism', kind: 'prism', pos: { x: 67.39949367592638, y: 106.72629356641588 }, radius: 18, angleDeg: 168.836815478986, movable: true, enabled: true }, mirror('s-m1', 90.67881058401372, 358.45093405596776, 73.69085977489239)] }
  },
  {
    id: 'level-009', index: 9, name: '折返长廊', hint: '光要先向上，再向右，再向下。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 520 }, angleDeg: 0, maxDistance: 900 },
    exits: [{ id: 'exit', pos: { x: 335, y: 410 }, radius: 20 }],
    tools: { mirror: 3, portableConcentrator: 0, prism: 0 },
    objects: [{ id: 'block-1', kind: 'obstacle', x: 130, y: 425, w: 180, h: 70 }, { id: 'block-2', kind: 'obstacle', x: 160, y: 190, w: 80, h: 135 }],
    solution: { objects: [mirror('s-m1', 72.3311207321947, 256.09477916621097, 0.4571212735550545), mirror('s-m2', 207.91713438004285, 449.1949507924479, 88.49829008711494), mirror('s-m3', 319.37909196911454, 540.0285428977395, 39.759493624581765)] }
  },
  {
    id: 'level-010', index: 10, name: '终局回廊', hint: '有限资源下，找到最短且能续航的路径。', width: W, height: H,
    source: { id: 'source', pos: { x: 48, y: 500 }, angleDeg: 0, maxDistance: 360 },
    exits: [{ id: 'exit', pos: { x: 335, y: 155 }, radius: 18 }],
    tools: { mirror: 3, portableConcentrator: 1, prism: 0 },
    objects: [{ id: 'block-1', kind: 'obstacle', x: 130, y: 340, w: 100, h: 120 }, { id: 'block-2', kind: 'obstacle', x: 230, y: 175, w: 52, h: 135 }],
    solution: { objects: [mirror('s-m1', 163.68936458166257, 212.62318850639855, 94.53304515558119), booster('s-b1', 101.30251036439377, 512.0684610318742, 261.361853923448, true), mirror('s-m2', 264.43388389425604, 496.8565939253689, 51.18987571849042), mirror('s-m3', 159.94151266784291, 385.2533618517387, 33.28571566836702)] }
  }
];

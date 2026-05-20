import { _decorator, Color, Component, EventTouch, Graphics, Input, UITransform, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

const LOGIC_WIDTH = 390;
const LOGIC_HEIGHT = 610;
const GRID_STEP = 30;

export type LogicPoint = {
  x: number;
  y: number;
};

export type BoardRaySegment = {
  from: LogicPoint;
  to: LogicPoint;
  color?: string;
};

export type BoardSource = {
  id?: string;
  pos: LogicPoint;
  angleDeg: number;
};

export type BoardExit = {
  id: string;
  pos: LogicPoint;
  radius: number;
};

export type BoardObstacle = {
  id: string;
  kind: 'obstacle';
  x: number;
  y: number;
  w: number;
  h: number;
};

export type BoardMirror = {
  id: string;
  kind: 'mirror';
  pos: LogicPoint;
  angleDeg: number;
  length: number;
};

export type BoardConcentrator = {
  id: string;
  kind: 'portableConcentrator' | 'fixedConcentrator' | 'concentrator';
  pos: LogicPoint;
  radius: number;
  movable?: boolean;
};

export type BoardPrism = {
  id: string;
  kind: 'prism';
  pos: LogicPoint;
  radius: number;
  angleDeg: number;
  enabled?: boolean;
};

export type BoardObject = BoardObstacle | BoardMirror | BoardConcentrator | BoardPrism;

export type BoardRenderLevel = {
  source: BoardSource;
  exits: BoardExit[];
  objects?: BoardObject[];
};

export type BoardRenderSimulation = {
  segments?: BoardRaySegment[];
  placedObjects?: BoardObject[];
};

type BoardTouchHandler = (logicPos: LogicPoint) => void;

@ccclass('CanvasBoardRenderer')
export class CanvasBoardRenderer extends Component {
  @property(Graphics)
  graphics: Graphics | null = null;

  private touchStartHandler: BoardTouchHandler | null = null;
  private touchMoveHandler: BoardTouchHandler | null = null;
  private touchEndHandler: (() => void) | null = null;

  onLoad() {
    this.graphics = this.graphics ?? this.getComponent(Graphics) ?? this.node.addComponent(Graphics);

    const uiTransform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    uiTransform.setContentSize(LOGIC_WIDTH, LOGIC_HEIGHT);

    this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onDestroy() {
    this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  public setInputHandlers(onStart: BoardTouchHandler, onMove: BoardTouchHandler, onEnd: () => void) {
    this.touchStartHandler = onStart;
    this.touchMoveHandler = onMove;
    this.touchEndHandler = onEnd;
  }

  public render(level: BoardRenderLevel, sim: BoardRenderSimulation | null, selectedId: string | null) {
    const g = this.graphics;
    if (!g) {
      return;
    }

    const staticObjects = level.objects ?? [];
    const placedObjects = sim?.placedObjects ?? [];
    const segments = sim?.segments ?? [];

    g.clear();
    this.drawBackgroundAndGrid(g);
    this.drawSource(g, level.source);
    this.drawExits(g, level.exits);

    for (const obj of staticObjects) {
      this.drawObject(g, obj, obj.id === selectedId);
    }
    for (const obj of placedObjects) {
      this.drawObject(g, obj, obj.id === selectedId);
    }

    this.drawRaySegments(g, segments);
  }

  public logicToLocal(p: LogicPoint): LogicPoint {
    return {
      x: p.x - 390 / 2,
      y: 610 / 2 - p.y,
    };
  }

  public localToLogic(p: LogicPoint): LogicPoint {
    return {
      x: p.x + 390 / 2,
      y: 610 / 2 - p.y,
    };
  }

  public screenToLogic(screenPoint: LogicPoint): LogicPoint {
    const uiTransform = this.node.getComponent(UITransform);
    if (!uiTransform) {
      return { x: 390 / 2, y: 610 / 2 };
    }
    const local = uiTransform.convertToNodeSpaceAR(new Vec3(screenPoint.x, screenPoint.y, 0));
    return this.localToLogic({ x: local.x, y: local.y });
  }

  public logicToScreen(logicPoint: LogicPoint): LogicPoint {
    const uiTransform = this.node.getComponent(UITransform);
    if (!uiTransform) {
      return logicPoint;
    }
    const local = this.logicToLocal(logicPoint);
    const screen = uiTransform.convertToWorldSpaceAR(new Vec3(local.x, local.y, 0));
    return { x: screen.x, y: screen.y };
  }

  public touchToLogic(e: EventTouch): LogicPoint {
    const location = e.getUILocation();
    return this.screenToLogic({ x: location.x, y: location.y });
  }

  private onTouchStart(e: EventTouch) {
    if (!this.touchStartHandler) {
      return;
    }
    this.touchStartHandler(this.touchToLogic(e));
  }

  private onTouchMove(e: EventTouch) {
    if (!this.touchMoveHandler) {
      return;
    }
    this.touchMoveHandler(this.touchToLogic(e));
  }

  private onTouchEnd() {
    if (!this.touchEndHandler) {
      return;
    }
    this.touchEndHandler();
  }

  private drawBackgroundAndGrid(g: Graphics) {
    const left = -LOGIC_WIDTH / 2;
    const top = LOGIC_HEIGHT / 2;
    const bottom = -LOGIC_HEIGHT / 2;

    g.fillColor = new Color(7, 10, 18, 255);
    g.rect(left, bottom, LOGIC_WIDTH, LOGIC_HEIGHT);
    g.fill();

    g.fillColor = new Color(13, 17, 29, 255);
    g.roundRect(left + 6, bottom + 6, LOGIC_WIDTH - 12, LOGIC_HEIGHT - 12, 16);
    g.fill();

    g.strokeColor = new Color(96, 118, 152, 44);
    g.lineWidth = 1;
    for (let x = 0; x <= LOGIC_WIDTH; x += GRID_STEP) {
      const a = this.logicToLocal({ x, y: 0 });
      const b = this.logicToLocal({ x, y: LOGIC_HEIGHT });
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    }
    for (let y = 0; y <= LOGIC_HEIGHT; y += GRID_STEP) {
      const a = this.logicToLocal({ x: 0, y });
      const b = this.logicToLocal({ x: LOGIC_WIDTH, y });
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    }
    g.stroke();

    g.strokeColor = new Color(142, 172, 223, 72);
    g.lineWidth = 2;
    g.roundRect(left + 2, bottom + 2, LOGIC_WIDTH - 4, LOGIC_HEIGHT - 4, 16);
    g.stroke();

    g.strokeColor = new Color(255, 255, 255, 24);
    g.lineWidth = 1;
    g.roundRect(left + 10, bottom + 10, LOGIC_WIDTH - 20, LOGIC_HEIGHT - 20, 12);
    g.stroke();

    g.moveTo(left + 16, top - 22);
    g.lineTo(left + LOGIC_WIDTH - 16, top - 22);
    g.stroke();
  }

  private drawSource(g: Graphics, source: BoardSource) {
    const p = this.logicToLocal(source.pos);
    const dir = angleToDir(source.angleDeg);
    const tail = { x: p.x - dir.x * 12, y: p.y - dir.y * 12 };
    const head = { x: p.x + dir.x * 20, y: p.y + dir.y * 20 };

    g.fillColor = new Color(58, 153, 255, 255);
    g.circle(p.x, p.y, 10);
    g.fill();

    g.fillColor = new Color(165, 216, 255, 220);
    g.circle(p.x, p.y, 4);
    g.fill();

    g.strokeColor = new Color(151, 211, 255, 255);
    g.lineWidth = 3;
    g.moveTo(tail.x, tail.y);
    g.lineTo(head.x, head.y);
    g.stroke();
  }

  private drawExits(g: Graphics, exits: BoardExit[]) {
    for (const ex of exits) {
      const p = this.logicToLocal(ex.pos);

      g.strokeColor = new Color(255, 225, 132, 212);
      g.lineWidth = 3;
      g.circle(p.x, p.y, ex.radius);
      g.stroke();

      g.strokeColor = new Color(255, 225, 132, 104);
      g.lineWidth = 1;
      g.circle(p.x, p.y, ex.radius + 7);
      g.stroke();
    }
  }

  private drawObject(g: Graphics, obj: BoardObject, selected: boolean) {
    if (obj.kind === 'obstacle') {
      this.drawObstacle(g, obj, selected);
      return;
    }

    if (obj.kind === 'mirror') {
      this.drawMirror(g, obj, selected);
      return;
    }

    if (obj.kind === 'prism') {
      this.drawPrism(g, obj, selected);
      return;
    }

    this.drawConcentrator(g, obj, selected);
  }

  private drawObstacle(g: Graphics, obstacle: BoardObstacle, selected: boolean) {
    const topLeft = this.logicToLocal({ x: obstacle.x, y: obstacle.y });
    const y = topLeft.y - obstacle.h;

    g.fillColor = new Color(22, 28, 40, 255);
    g.rect(topLeft.x, y, obstacle.w, obstacle.h);
    g.fill();

    if (selected) {
      g.strokeColor = new Color(148, 194, 255, 128);
      g.lineWidth = 4;
      g.rect(topLeft.x - 2, y - 2, obstacle.w + 4, obstacle.h + 4);
      g.stroke();
    }

    g.strokeColor = new Color(91, 110, 140, 150);
    g.lineWidth = 1.5;
    g.rect(topLeft.x, y, obstacle.w, obstacle.h);
    g.stroke();
  }

  private drawMirror(g: Graphics, mirror: BoardMirror, selected: boolean) {
    const endpoints = mirrorEndpoints(mirror);
    const a = this.logicToLocal(endpoints.a);
    const b = this.logicToLocal(endpoints.b);

    if (selected) {
      g.strokeColor = new Color(130, 187, 255, 110);
      g.lineWidth = 10;
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    }

    g.strokeColor = new Color(236, 243, 255, 235);
    g.lineWidth = 4;
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    g.stroke();

    const dir = angleToDir(mirror.angleDeg);
    const handle = this.logicToLocal({
      x: mirror.pos.x + dir.x * (mirror.length / 2 + 22),
      y: mirror.pos.y + dir.y * (mirror.length / 2 + 22),
    });

    g.fillColor = selected ? new Color(115, 202, 255, 220) : new Color(162, 174, 192, 170);
    g.circle(handle.x, handle.y, 8);
    g.fill();
  }

  private drawConcentrator(g: Graphics, concentrator: BoardConcentrator, selected: boolean) {
    const p = this.logicToLocal(concentrator.pos);
    const isFixed =
      concentrator.kind === 'fixedConcentrator' ||
      (concentrator.kind === 'concentrator' && concentrator.movable === false);
    const ringColor = isFixed ? new Color(255, 164, 72, 255) : new Color(255, 213, 85, 255);

    if (selected) {
      g.strokeColor = new Color(255, 227, 158, 100);
      g.lineWidth = 9;
      g.circle(p.x, p.y, concentrator.radius + 2);
      g.stroke();
    }

    g.strokeColor = ringColor;
    g.lineWidth = 2.5;
    g.circle(p.x, p.y, concentrator.radius);
    g.stroke();

    g.fillColor = new Color(ringColor.r, ringColor.g, ringColor.b, 72);
    g.circle(p.x, p.y, Math.max(4, concentrator.radius - 5));
    g.fill();
  }

  private drawPrism(g: Graphics, prism: BoardPrism, selected: boolean) {
    const center = this.logicToLocal(prism.pos);
    const baseRad = degToRad(prism.angleDeg);
    const p1 = {
      x: center.x + Math.cos(baseRad) * prism.radius,
      y: center.y + Math.sin(baseRad) * prism.radius,
    };
    const p2 = {
      x: center.x + Math.cos(baseRad + (Math.PI * 2) / 3) * prism.radius,
      y: center.y + Math.sin(baseRad + (Math.PI * 2) / 3) * prism.radius,
    };
    const p3 = {
      x: center.x + Math.cos(baseRad - (Math.PI * 2) / 3) * prism.radius,
      y: center.y + Math.sin(baseRad - (Math.PI * 2) / 3) * prism.radius,
    };

    if (selected) {
      g.strokeColor = new Color(196, 136, 255, 100);
      g.lineWidth = 8;
      g.moveTo(p1.x, p1.y);
      g.lineTo(p2.x, p2.y);
      g.lineTo(p3.x, p3.y);
      g.close();
      g.stroke();
    }

    g.fillColor = new Color(164, 98, 245, prism.enabled === false ? 25 : 85);
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.lineTo(p3.x, p3.y);
    g.close();
    g.fill();

    g.strokeColor = new Color(205, 157, 255, prism.enabled === false ? 110 : 250);
    g.lineWidth = 2;
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.lineTo(p3.x, p3.y);
    g.close();
    g.stroke();
  }

  private drawRaySegments(g: Graphics, segments: BoardRaySegment[]) {
    for (const segment of segments) {
      const a = this.logicToLocal(segment.from);
      const b = this.logicToLocal(segment.to);
      const color = this.colorForRay(segment.color ?? 'white');

      g.strokeColor = new Color(color.r, color.g, color.b, 90);
      g.lineWidth = 7;
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();

      g.strokeColor = color;
      g.lineWidth = 3;
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    }
  }

  private colorForRay(color: string): Color {
    if (color === 'red') {
      return new Color(255, 84, 84, 238);
    }
    if (color === 'green') {
      return new Color(68, 228, 116, 238);
    }
    if (color === 'blue') {
      return new Color(72, 166, 255, 238);
    }
    return new Color(228, 242, 255, 235);
  }
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function angleToDir(angleDeg: number): LogicPoint {
  const rad = degToRad(angleDeg);
  return {
    x: Math.cos(rad),
    y: Math.sin(rad),
  };
}

function mirrorEndpoints(mirror: BoardMirror): { a: LogicPoint; b: LogicPoint } {
  const dir = angleToDir(mirror.angleDeg);
  const halfLength = mirror.length / 2;
  return {
    a: { x: mirror.pos.x - dir.x * halfLength, y: mirror.pos.y - dir.y * halfLength },
    b: { x: mirror.pos.x + dir.x * halfLength, y: mirror.pos.y + dir.y * halfLength },
  };
}

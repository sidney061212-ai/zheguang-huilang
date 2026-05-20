import { _decorator, Color, Component, EventTouch, Graphics, Input, UITransform, Vec3 } from 'cc';
import { angleToDir } from '../core/math/Vec2Math';
import { mirrorEndpoints } from '../core/optics/Geometry';
import type {
  ConcentratorObject,
  LevelConfig,
  LevelObject,
  MirrorObject,
  PlacedObject,
  PrismObject,
  RaySegment,
  Vec2,
} from '../core/optics/types';

const { ccclass, property } = _decorator;

type BoardTouchHandler = (pos: Vec2) => void;

@ccclass('BoardView')
export class BoardView extends Component {
  @property(Graphics)
  graphics: Graphics | null = null;

  @property
  boardWidth = 390;

  @property
  boardHeight = 610;

  private touchStartHandler: BoardTouchHandler | null = null;
  private touchMoveHandler: BoardTouchHandler | null = null;
  private touchEndHandler: (() => void) | null = null;

  onLoad() {
    this.graphics = this.graphics ?? this.getComponent(Graphics) ?? this.node.addComponent(Graphics);
    const uiTransform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    uiTransform.setContentSize(this.boardWidth, this.boardHeight);

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

  public render(level: LevelConfig, placed: PlacedObject[], segments: RaySegment[], selectedId: string | null) {
    if (!this.graphics) {
      return;
    }
    this.boardWidth = level.width;
    this.boardHeight = level.height;
    const uiTransform = this.node.getComponent(UITransform);
    if (uiTransform) {
      uiTransform.setContentSize(this.boardWidth, this.boardHeight);
    }

    const g = this.graphics;
    g.clear();

    this.drawBoardBackground(g, level.width, level.height);
    this.drawSource(g, level);
    this.drawExits(g, level);

    for (const obj of level.objects) {
      this.drawObject(g, obj, false);
    }

    for (const obj of placed) {
      this.drawObject(g, obj, obj.id === selectedId);
    }

    this.drawRaySegments(g, segments);
  }

  public toLogicalFromTouch(e: EventTouch): Vec2 {
    const loc = e.getUILocation();
    const uiTransform = this.node.getComponent(UITransform);
    if (!uiTransform) {
      return { x: this.boardWidth / 2, y: this.boardHeight / 2 };
    }

    const local = uiTransform.convertToNodeSpaceAR(new Vec3(loc.x, loc.y, 0));
    return {
      x: local.x + this.boardWidth / 2,
      y: this.boardHeight / 2 - local.y,
    };
  }

  private onTouchStart(e: EventTouch) {
    if (!this.touchStartHandler) {
      return;
    }
    this.touchStartHandler(this.toLogicalFromTouch(e));
  }

  private onTouchMove(e: EventTouch) {
    if (!this.touchMoveHandler) {
      return;
    }
    this.touchMoveHandler(this.toLogicalFromTouch(e));
  }

  private onTouchEnd() {
    if (!this.touchEndHandler) {
      return;
    }
    this.touchEndHandler();
  }

  private drawBoardBackground(g: Graphics, width: number, height: number) {
    const left = -width / 2;
    const bottom = -height / 2;

    g.fillColor = new Color(7, 10, 18, 255);
    g.rect(left, bottom, width, height);
    g.fill();

    g.fillColor = new Color(14, 19, 30, 255);
    g.roundRect(left + 6, bottom + 6, width - 12, height - 12, 16);
    g.fill();

    g.strokeColor = new Color(230, 236, 255, 20);
    g.lineWidth = 1;
    const grid = 30;
    for (let x = 0; x <= width; x += grid) {
      const a = this.toCanvas({ x, y: 0 }, width, height);
      const b = this.toCanvas({ x, y: height }, width, height);
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    }
    for (let y = 0; y <= height; y += grid) {
      const a = this.toCanvas({ x: 0, y }, width, height);
      const b = this.toCanvas({ x: width, y }, width, height);
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    }
    g.stroke();

    g.strokeColor = new Color(147, 180, 255, 42);
    g.lineWidth = 2;
    g.roundRect(left + 2, bottom + 2, width - 4, height - 4, 16);
    g.stroke();
  }

  private drawSource(g: Graphics, level: LevelConfig) {
    const p = this.toCanvas(level.source.pos, level.width, level.height);
    const dir = angleToDir(level.source.angleDeg);
    const tail = { x: p.x - dir.x * 14, y: p.y - dir.y * 14 };
    const head = { x: p.x + dir.x * 18, y: p.y + dir.y * 18 };

    g.fillColor = new Color(29, 126, 255, 255);
    g.circle(p.x, p.y, 10);
    g.fill();

    g.strokeColor = new Color(132, 188, 255, 255);
    g.lineWidth = 3;
    g.moveTo(tail.x, tail.y);
    g.lineTo(head.x, head.y);
    g.stroke();
  }

  private drawExits(g: Graphics, level: LevelConfig) {
    for (const ex of level.exits) {
      const p = this.toCanvas(ex.pos, level.width, level.height);
      g.strokeColor = new Color(254, 215, 120, 195);
      g.lineWidth = 3;
      g.circle(p.x, p.y, ex.radius);
      g.stroke();

      g.strokeColor = new Color(254, 215, 120, 92);
      g.lineWidth = 1;
      g.circle(p.x, p.y, ex.radius + 7);
      g.stroke();
    }
  }

  private drawObject(g: Graphics, obj: LevelObject, selected: boolean) {
    if (obj.kind === 'obstacle') {
      const p = this.toCanvas({ x: obj.x, y: obj.y }, this.boardWidth, this.boardHeight);
      g.fillColor = new Color(22, 28, 40, 255);
      g.rect(p.x, p.y - obj.h, obj.w, obj.h);
      g.fill();

      g.strokeColor = new Color(91, 110, 140, 145);
      g.lineWidth = 1.5;
      g.rect(p.x, p.y - obj.h, obj.w, obj.h);
      g.stroke();
      return;
    }

    if (obj.kind === 'mirror') {
      this.drawMirror(g, obj, selected);
      return;
    }

    if (obj.kind === 'portableConcentrator' || obj.kind === 'fixedConcentrator') {
      this.drawConcentrator(g, obj, selected);
      return;
    }

    this.drawPrism(g, obj, selected);
  }

  private drawMirror(g: Graphics, mirror: MirrorObject, selected: boolean) {
    const { a, b } = mirrorEndpoints(mirror);
    const aa = this.toCanvas(a, this.boardWidth, this.boardHeight);
    const bb = this.toCanvas(b, this.boardWidth, this.boardHeight);

    if (selected) {
      g.strokeColor = new Color(130, 187, 255, 110);
      g.lineWidth = 10;
      g.moveTo(aa.x, aa.y);
      g.lineTo(bb.x, bb.y);
      g.stroke();
    }

    g.strokeColor = new Color(236, 243, 255, 235);
    g.lineWidth = 4;
    g.moveTo(aa.x, aa.y);
    g.lineTo(bb.x, bb.y);
    g.stroke();

    const d = angleToDir(mirror.angleDeg);
    const handle = {
      x: mirror.pos.x + d.x * (mirror.length / 2 + 22),
      y: mirror.pos.y + d.y * (mirror.length / 2 + 22),
    };
    const hp = this.toCanvas(handle, this.boardWidth, this.boardHeight);
    g.fillColor = selected ? new Color(115, 202, 255, 220) : new Color(162, 174, 192, 170);
    g.circle(hp.x, hp.y, 8);
    g.fill();
  }

  private drawConcentrator(g: Graphics, c: ConcentratorObject, selected: boolean) {
    const p = this.toCanvas(c.pos, this.boardWidth, this.boardHeight);
    const ringColor = c.kind === 'fixedConcentrator' ? new Color(255, 164, 72, 255) : new Color(255, 213, 85, 255);

    if (selected) {
      g.strokeColor = new Color(255, 227, 158, 100);
      g.lineWidth = 9;
      g.circle(p.x, p.y, c.radius + 2);
      g.stroke();
    }

    g.strokeColor = ringColor;
    g.lineWidth = 2.5;
    g.circle(p.x, p.y, c.radius);
    g.stroke();

    g.fillColor = new Color(ringColor.r, ringColor.g, ringColor.b, 72);
    g.circle(p.x, p.y, Math.max(4, c.radius - 5));
    g.fill();
  }

  private drawPrism(g: Graphics, prism: PrismObject, selected: boolean) {
    const p = this.toCanvas(prism.pos, this.boardWidth, this.boardHeight);
    const radius = prism.radius;
    const baseRad = (prism.angleDeg * Math.PI) / 180;
    const p1 = { x: p.x + Math.cos(baseRad) * radius, y: p.y + Math.sin(baseRad) * radius };
    const p2 = { x: p.x + Math.cos(baseRad + (Math.PI * 2) / 3) * radius, y: p.y + Math.sin(baseRad + (Math.PI * 2) / 3) * radius };
    const p3 = { x: p.x + Math.cos(baseRad - (Math.PI * 2) / 3) * radius, y: p.y + Math.sin(baseRad - (Math.PI * 2) / 3) * radius };

    if (selected) {
      g.strokeColor = new Color(196, 136, 255, 100);
      g.lineWidth = 8;
      g.moveTo(p1.x, p1.y);
      g.lineTo(p2.x, p2.y);
      g.lineTo(p3.x, p3.y);
      g.close();
      g.stroke();
    }

    g.fillColor = new Color(164, 98, 245, prism.enabled ? 85 : 25);
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.lineTo(p3.x, p3.y);
    g.close();
    g.fill();

    g.strokeColor = new Color(205, 157, 255, prism.enabled ? 250 : 110);
    g.lineWidth = 2;
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.lineTo(p3.x, p3.y);
    g.close();
    g.stroke();
  }

  private drawRaySegments(g: Graphics, segments: RaySegment[]) {
    for (const seg of segments) {
      const a = this.toCanvas(seg.from, this.boardWidth, this.boardHeight);
      const b = this.toCanvas(seg.to, this.boardWidth, this.boardHeight);

      const color = this.colorForRay(seg.color);
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

  private toCanvas(p: Vec2, width: number, height: number): Vec2 {
    return {
      x: p.x - width / 2,
      y: height / 2 - p.y,
    };
  }
}

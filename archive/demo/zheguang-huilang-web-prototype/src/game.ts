import {
  angleToDir,
  clamp,
  dirToAngle,
  dist,
  pointInCircle,
  type Vec
} from "./core/math";
import {
  cloneLevel,
  lightColorToCss,
  mirrorEndpoints,
  moveObject,
  objectHitTest,
  simulateLight
} from "./core/optics";
import type { Level, OpticalObject, SimulationResult, ToolKind } from "./core/types";
import { levels, LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./levels";
type DragState =
  | {
      mode: "move";
      objectId: string;
      offset: Vec;
    }
  | {
      mode: "rotate";
      objectId: string;
    }
  | null;
export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private levelIndex = 0;
  private level: Level;
  private sim: SimulationResult;
  private selectedObjectId: string | null = null;
  private dragState: DragState = null;
  private activeTool: ToolKind | null = null;
  private levelNameEl: HTMLElement;
  private statusEl: HTMLElement;
  private toolbarEl: HTMLElement;
  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not available");
    this.canvas = canvas;
    this.ctx = ctx;
    this.level = cloneLevel(levels[this.levelIndex]);
    this.sim = simulateLight(this.level);
    this.levelNameEl = document.getElementById("levelName")!;
    this.statusEl = document.getElementById("status")!;
    this.toolbarEl = document.getElementById("toolbar")!;
    this.setupCanvas();
    this.bindEvents();
    this.renderToolbar();
    this.updateHud();
    requestAnimationFrame(() => this.loop());
  }
  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.min(window.innerWidth, 430);
    const cssH = Math.min(window.innerHeight, 860);
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.floor(cssW * dpr);
    this.canvas.height = Math.floor(cssH * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale((cssW * dpr) / LOGICAL_WIDTH, (cssH * dpr) / LOGICAL_HEIGHT);
  }
  private bindEvents() {
    window.addEventListener("resize", () => this.setupCanvas());
    this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.canvas.addEventListener("pointermove", (e) => this.onPointerMove(e));
    window.addEventListener("pointerup", () => this.onPointerUp());
    document.getElementById("resetBtn")!.addEventListener("click", () => this.resetLevel());
    document.getElementById("nextBtn")!.addEventListener("click", () => this.nextLevel());
    document.getElementById("prevBtn")!.addEventListener("click", () => this.prevLevel());
  }
  private toWorld(e: PointerEvent): Vec {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * LOGICAL_WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * LOGICAL_HEIGHT
    };
  }
  private onPointerDown(e: PointerEvent) {
    const p = this.toWorld(e);
    const handle = this.findRotateHandle(p);
    if (handle) {
      this.selectedObjectId = handle.id;
      this.dragState = {
        mode: "rotate",
        objectId: handle.id
      };
      return;
    }
    const obj = this.findTopObject(p);
    if (obj && "movable" in obj && obj.movable) {
      this.selectedObjectId = obj.id;
      this.dragState = {
        mode: "move",
        objectId: obj.id,
        offset: {
          x: obj.pos.x - p.x,
          y: obj.pos.y - p.y
        }
      };
      return;
    }
    if (this.activeTool) {
      this.spawnTool(this.activeTool, p);
      this.activeTool = null;
      this.renderToolbar();
    } else {
      this.selectedObjectId = null;
    }
  }
  private onPointerMove(e: PointerEvent) {
    if (!this.dragState) return;
    const p = this.toWorld(e);
    const obj = this.level.objects.find((o) => o.id === this.dragState?.objectId);
    if (!obj) return;
    if (this.dragState.mode === "move") {
      const newPos = {
        x: clamp(p.x + this.dragState.offset.x, 28, LOGICAL_WIDTH - 28),
        y: clamp(p.y + this.dragState.offset.y, 82, LOGICAL_HEIGHT - 178)
      };
      moveObject(obj, newPos);
      this.recalculate();
    }
    if (this.dragState.mode === "rotate" && obj.kind === "mirror") {
      obj.angleDeg = dirToAngle({
        x: p.x - obj.pos.x,
        y: p.y - obj.pos.y
      });
      this.recalculate();
    }
    if (this.dragState.mode === "rotate" && obj.kind === "prism") {
      obj.angleDeg = dirToAngle({
        x: p.x - obj.pos.x,
        y: p.y - obj.pos.y
      });
      this.recalculate();
    }
  }
  private onPointerUp() {
    this.dragState = null;
  }
  private spawnTool(kind: ToolKind, pos: Vec) {
    const id = `${kind}-${Date.now()}`;
    if (kind === "mirror" && this.level.tools.mirror > 0) {
      this.level.tools.mirror -= 1;
      this.level.objects.push({
        id,
        kind: "mirror",
        pos,
        angleDeg: -35,
        length: 88,
        movable: true
      });
    }
    if (kind === "portableConcentrator" && this.level.tools.portableConcentrator > 0) {
      this.level.tools.portableConcentrator -= 1;
      this.level.objects.push({
        id,
        kind: "concentrator",
        pos,
        radius: 23,
        boostDistance: 240,
        movable: true
      });
    }
    if (kind === "prism" && this.level.tools.prism > 0) {
      this.level.tools.prism -= 1;
      this.level.objects.push({
        id,
        kind: "prism",
        pos,
        radius: 25,
        angleDeg: 0,
        movable: true
      });
    }
    this.selectedObjectId = id;
    this.renderToolbar();
    this.recalculate();
  }
  private findTopObject(p: Vec): OpticalObject | null {
    for (let i = this.level.objects.length - 1; i >= 0; i--) {
      const obj = this.level.objects[i];
      if (objectHitTest(obj, p)) return obj;
    }
    return null;
  }
  private findRotateHandle(p: Vec): { id: string } | null {
    for (const obj of this.level.objects) {
      if (obj.kind === "mirror") {
        const dir = angleToDir(obj.angleDeg);
        const handle = {
          x: obj.pos.x + dir.x * (obj.length / 2 + 25),
          y: obj.pos.y + dir.y * (obj.length / 2 + 25)
        };
        if (dist(p, handle) <= 17) return { id: obj.id };
      }
      if (obj.kind === "prism") {
        const dir = angleToDir(obj.angleDeg);
        const handle = {
          x: obj.pos.x + dir.x * 42,
          y: obj.pos.y + dir.y * 42
        };
        if (dist(p, handle) <= 17) return { id: obj.id };
      }
    }
    return null;
  }
  private recalculate() {
    this.sim = simulateLight(this.level);
    this.updateHud();
  }
  private resetLevel() {
    this.level = cloneLevel(levels[this.levelIndex]);
    this.selectedObjectId = null;
    this.activeTool = null;
    this.recalculate();
    this.renderToolbar();
  }
  private nextLevel() {
    this.levelIndex = (this.levelIndex + 1) % levels.length;
    this.resetLevel();
  }
  private prevLevel() {
    this.levelIndex = (this.levelIndex - 1 + levels.length) % levels.length;
    this.resetLevel();
  }
  private updateHud() {
    this.levelNameEl.textContent = this.level.name;
    if (this.sim.success) {
      this.statusEl.textContent = "光已抵达。点击下一关，或者继续调整找更优雅的路线。";
    } else if (this.sim.reason === "blocked") {
      this.statusEl.textContent = "光路被阻挡。";
    } else if (this.sim.reason === "distance_lost") {
      this.statusEl.textContent = "光程耗尽了，还差一点。";
    } else {
      this.statusEl.textContent = this.level.hint;
    }
  }
  private renderToolbar() {
    this.toolbarEl.innerHTML = "";
    const items: Array<{ kind: ToolKind; label: string; count: number }> = [
      { kind: "mirror", label: "镜子", count: this.level.tools.mirror },
      { kind: "portableConcentrator", label: "便携聚光器", count: this.level.tools.portableConcentrator },
      { kind: "prism", label: "三棱镜", count: this.level.tools.prism }
    ];
    for (const item of items) {
      if (item.count <= 0) continue;
      const el = document.createElement("button");
      el.className = `tool ${this.activeTool === item.kind ? "active" : ""}`;
      el.textContent = `${item.label} × ${item.count}`;
      el.onclick = () => {
        this.activeTool = this.activeTool === item.kind ? null : item.kind;
        this.renderToolbar();
      };
      this.toolbarEl.appendChild(el);
    }
  }
  private loop() {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
  private draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.drawBackground();
    this.drawLevelObjects();
    this.drawLight();
    this.drawSelection();
  }
  private drawBackground() {
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    g.addColorStop(0, "#f8fbff");
    g.addColorStop(1, "#eef6ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.fillRect(22, 78, LOGICAL_WIDTH - 44, LOGICAL_HEIGHT - 225);
    ctx.strokeStyle = "rgba(80,120,180,0.10)";
    ctx.lineWidth = 1;
    for (let y = 105; y < 590; y += 40) {
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(LOGICAL_WIDTH - 32, y);
      ctx.stroke();
    }
  }
  private drawLevelObjects() {
    const ctx = this.ctx;
    this.drawSource();
    for (const ex of this.level.exits) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex.pos.x, ex.pos.y, ex.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.sim.success ? "rgba(80,220,180,0.35)" : "rgba(120,150,190,0.16)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.sim.success ? "rgba(60,210,170,0.9)" : "rgba(80,110,160,0.45)";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex.pos.x, ex.pos.y, ex.radius + 9, 0, Math.PI * 2);
      ctx.strokeStyle = this.sim.success ? "rgba(60,210,170,0.25)" : "rgba(80,110,160,0.12)";
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();
    }
    for (const obj of this.level.objects) {
      if (obj.kind === "obstacle") {
        ctx.fillStyle = "rgba(58,74,102,0.82)";
        roundRect(ctx, obj.x, obj.y, obj.w, obj.h, 14);
        ctx.fill();
      }
      if (obj.kind === "concentrator") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(obj.pos.x, obj.pos.y, obj.radius, 0, Math.PI * 2);
        ctx.fillStyle = obj.movable ? "rgba(120,190,255,0.30)" : "rgba(255,205,95,0.33)";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = obj.movable ? "rgba(80,150,255,0.80)" : "rgba(240,170,60,0.85)";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(obj.pos.x, obj.pos.y, obj.radius + 9, 0, Math.PI * 2);
        ctx.strokeStyle = obj.movable ? "rgba(80,150,255,0.16)" : "rgba(240,170,60,0.16)";
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.restore();
      }
      if (obj.kind === "prism") {
        ctx.save();
        ctx.translate(obj.pos.x, obj.pos.y);
        ctx.rotate((obj.angleDeg * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(28, 22);
        ctx.lineTo(-28, 22);
        ctx.closePath();
        ctx.fillStyle = "rgba(150, 190, 255, 0.28)";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(95, 130, 230, 0.85)";
        ctx.stroke();
        ctx.restore();
      }
      if (obj.kind === "mirror") {
        const { a, b } = mirrorEndpoints(obj);
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = 9;
        ctx.strokeStyle = "rgba(40,70,120,0.22)";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(245,250,255,0.98)";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(75,120,210,0.82)";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
  private drawSource() {
    const ctx = this.ctx;
    const s = this.level.source;
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.pos.x, s.pos.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(80,190,255,0.28)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(70,155,230,0.85)";
    ctx.stroke();
    const dir = angleToDir(s.angleDeg);
    ctx.beginPath();
    ctx.moveTo(s.pos.x, s.pos.y);
    ctx.lineTo(s.pos.x + dir.x * 24, s.pos.y + dir.y * 24);
    ctx.strokeStyle = "rgba(70,155,230,0.9)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }
  private drawLight() {
    const ctx = this.ctx;
    for (const seg of this.sim.segments) {
      const maxRemaining = this.level.source.maxDistance;
      const color = lightColorToCss(seg.color);
      const alphaStart = clamp(seg.remainingStart / maxRemaining, 0.22, 1);
      const alphaEnd = clamp(seg.remainingEnd / maxRemaining, 0.06, 0.85);
      const g = ctx.createLinearGradient(seg.from.x, seg.from.y, seg.to.x, seg.to.y);
      g.addColorStop(0, withAlpha(color, alphaStart));
      g.addColorStop(1, withAlpha(color, alphaEnd));
      ctx.save();
      ctx.lineCap = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = g;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = withAlpha("#ffffff", 0.76);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
      ctx.stroke();
      ctx.restore();
    }
  }
  private drawSelection() {
    const ctx = this.ctx;
    if (!this.selectedObjectId) return;
    const obj = this.level.objects.find((o) => o.id === this.selectedObjectId);
    if (!obj) return;
    if (obj.kind === "mirror") {
      const { a, b } = mirrorEndpoints(obj);
      ctx.save();
      ctx.strokeStyle = "rgba(75,120,255,0.36)";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const dir = angleToDir(obj.angleDeg);
      const handle = {
        x: obj.pos.x + dir.x * (obj.length / 2 + 25),
        y: obj.pos.y + dir.y * (obj.length / 2 + 25)
      };
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(75,120,255,0.92)";
      ctx.fill();
      ctx.restore();
    }
    if (obj.kind === "concentrator" || obj.kind === "prism") {
      ctx.save();
      ctx.beginPath();
      ctx.arc(obj.pos.x, obj.pos.y, obj.kind === "concentrator" ? obj.radius + 12 : obj.radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(75,120,255,0.45)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }
  }
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith("#")) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

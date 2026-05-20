import { _decorator, Color, Component, Input, Label, Node, UITransform, Vec3, view } from 'cc';
import { angleToDir, clamp, dirToAngleDeg, dist } from '../core/math/Vec2Math';
import { mirrorEndpoints } from '../core/optics/Geometry';
import { simulateRuntime } from '../core/optics/LightSimulator';
import type {
  LevelConfig,
  MirrorObject,
  PlacedObject,
  SimulationResult,
  ToolKind,
  Vec2,
} from '../core/optics/types';
import { LevelPackV01 } from '../levels/LevelPackV01';
import { VictoryPanel } from '../ui/VictoryPanel';
import { BoardView } from '../views/BoardView';
import { ToolbarView } from '../views/ToolbarView';

const { ccclass } = _decorator;

const LOGICAL_W = 390;
const LOGICAL_H = 610;

type DragMode = 'move' | 'rotate' | null;
type ToolUsage = Record<ToolKind, number>;

@ccclass('PrismLabGameController')
export class PrismLabGameController extends Component {
  private boardView: BoardView | null = null;
  private toolbarView: ToolbarView | null = null;
  private victoryPanel: VictoryPanel | null = null;

  private gameTitleLabel: Label | null = null;
  private levelTitleLabel: Label | null = null;
  private progressLabel: Label | null = null;
  private hintLabel: Label | null = null;

  private levelIndex = 0;
  private level: LevelConfig = LevelPackV01[0];
  private placed: PlacedObject[] = [];
  private selectedTool: ToolKind | null = null;
  private selectedId: string | null = null;

  private dragMode: DragMode = null;
  private dragOffset: Vec2 = { x: 0, y: 0 };
  private won = false;
  private idSeed = 0;

  onLoad() {
    this.bootstrapScene();

    this.boardView?.setInputHandlers(
      this.onBoardTouchStart.bind(this),
      this.onBoardTouchMove.bind(this),
      this.onBoardTouchEnd.bind(this),
    );
    this.toolbarView?.bindSelectHandler(this.selectTool.bind(this));

    if (this.gameTitleLabel) {
      this.gameTitleLabel.string = 'Prism Lab / 折光回廊';
    }

    this.loadLevel(0);
  }

  public prevLevel() {
    this.loadLevel(this.levelIndex - 1);
  }

  public nextLevel() {
    this.loadLevel(this.levelIndex + 1);
  }

  public resetLevel() {
    this.loadLevel(this.levelIndex);
  }

  public selectMirror() {
    this.selectTool('mirror');
  }

  public selectPortableConcentrator() {
    this.selectTool('portableConcentrator');
  }

  public selectPrism() {
    this.selectTool('prism');
  }

  private bootstrapScene() {
    const gameRoot = this.node;

    const boardNode = this.ensureChild(gameRoot, 'Board');
    const boardTransform = boardNode.getComponent(UITransform) ?? boardNode.addComponent(UITransform);
    boardTransform.setContentSize(LOGICAL_W, LOGICAL_H);
    this.boardView = boardNode.getComponent(BoardView) ?? boardNode.addComponent(BoardView);

    const uiLayer = this.ensureChild(gameRoot, 'UILayer');
    const uiLayerTransform = uiLayer.getComponent(UITransform) ?? uiLayer.addComponent(UITransform);
    uiLayerTransform.setContentSize(LOGICAL_W + 40, LOGICAL_H + 250);

    const topBar = this.ensureChild(uiLayer, 'TopBar');
    topBar.setPosition(0, LOGICAL_H / 2 + 80, 0);
    const topBarTransform = topBar.getComponent(UITransform) ?? topBar.addComponent(UITransform);
    topBarTransform.setContentSize(LOGICAL_W + 30, 140);

    const toolbar = this.ensureChild(uiLayer, 'Toolbar');
    toolbar.setPosition(0, -LOGICAL_H / 2 - 74, 0);
    const toolbarTransform = toolbar.getComponent(UITransform) ?? toolbar.addComponent(UITransform);
    toolbarTransform.setContentSize(LOGICAL_W, 132);
    this.toolbarView = toolbar.getComponent(ToolbarView) ?? toolbar.addComponent(ToolbarView);

    const victory = this.ensureChild(uiLayer, 'VictoryPanel');
    victory.setPosition(0, 0, 0);
    const victoryTransform = victory.getComponent(UITransform) ?? victory.addComponent(UITransform);
    victoryTransform.setContentSize(LOGICAL_W, 220);
    this.victoryPanel = victory.getComponent(VictoryPanel) ?? victory.addComponent(VictoryPanel);

    this.wireTopBar(topBar, topBarTransform.contentSize.width);
    this.gameTitleLabel = this.ensureLabel(topBar, 'GameTitle', 0, 42, 24, new Color(235, 243, 255, 255));
    this.levelTitleLabel = this.ensureLabel(topBar, 'LevelTitle', 0, 13, 20, new Color(184, 208, 255, 255));
    this.progressLabel = this.ensureLabel(topBar, 'ProgressLabel', 0, -11, 16, new Color(136, 176, 244, 255));
    this.hintLabel = this.ensureLabel(topBar, 'HintLabel', 0, -34, 16, new Color(160, 192, 240, 255));

    this.applyBoardScale();
  }

  private wireTopBar(topBar: Node, width: number) {
    const createAction = (name: string, x: number, text: string, handler: () => void) => {
      const node = this.ensureChild(topBar, name);
      node.setPosition(x, -60, 0);
      const label = node.getComponent(Label) ?? node.addComponent(Label);
      label.string = text;
      label.fontSize = 20;
      label.lineHeight = 24;
      label.color = new Color(190, 216, 255, 255);
      label.horizontalAlign = 1;

      const touchZone = node.getComponent(UITransform) ?? node.addComponent(UITransform);
      touchZone.setContentSize(90, 34);

      if (!(node as any).__wiredTap__) {
        (node as any).__wiredTap__ = true;
        node.on(Input.EventType.TOUCH_END, handler, this);
      }
    };

    createAction('PrevButton', -width * 0.34, '上一关', this.prevLevel.bind(this));
    createAction('ResetButton', 0, '重置', this.resetLevel.bind(this));
    createAction('NextButton', width * 0.34, '下一关', this.nextLevel.bind(this));
  }

  private applyBoardScale() {
    const visible = view.getVisibleSize();
    const maxW = Math.max(320, visible.width - 24);
    const maxH = Math.max(420, visible.height - 220);
    const scale = Math.min(maxW / LOGICAL_W, maxH / LOGICAL_H);

    const boardNode = this.boardView?.node;
    if (boardNode) {
      boardNode.setScale(scale, scale, 1);
      boardNode.setPosition(0, 0, 0);
    }
  }

  private ensureLabel(parent: Node, name: string, x: number, y: number, fontSize: number, color: Color): Label {
    const node = this.ensureChild(parent, name);
    node.setPosition(x, y, 0);
    const label = node.getComponent(Label) ?? node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
    label.horizontalAlign = 1;
    return label;
  }

  private ensureChild(parent: Node, name: string): Node {
    const found = parent.getChildByName(name);
    if (found) {
      return found;
    }
    const created = new Node(name);
    created.parent = parent;
    return created;
  }

  private selectTool(kind: ToolKind) {
    if (!this.canPlaceTool(kind)) {
      this.setHint(`${this.toolName(kind)}数量已用尽`);
      this.refreshToolbar();
      return;
    }

    this.selectedTool = this.selectedTool === kind ? null : kind;
    this.refreshToolbar();
  }

  private loadLevel(index: number) {
    const total = LevelPackV01.length;
    if (total <= 0) {
      return;
    }

    this.levelIndex = ((index % total) + total) % total;
    this.level = LevelPackV01[this.levelIndex];
    this.placed = [];
    this.selectedId = null;
    this.dragMode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.won = false;

    this.selectedTool = this.findFirstAvailableTool();
    this.victoryPanel?.hide();

    this.render();
  }

  private findFirstAvailableTool(): ToolKind | null {
    if (this.level.tools.mirror > 0) {
      return 'mirror';
    }
    if (this.level.tools.portableConcentrator > 0) {
      return 'portableConcentrator';
    }
    if (this.level.tools.prism > 0) {
      return 'prism';
    }
    return null;
  }

  private render() {
    const result = simulateRuntime(this.level, this.placed);

    this.boardView?.render(this.level, this.placed, result.segments, this.selectedId);
    this.refreshHeader(result);
    this.refreshToolbar();
    this.syncVictory(result);
  }

  private syncVictory(result: SimulationResult) {
    if (!result.success) {
      this.won = false;
      this.victoryPanel?.hide();
      return;
    }

    if (this.won) {
      return;
    }

    this.won = true;
    this.victoryPanel?.show('通关成功，点击下一关继续', () => this.nextLevel());
  }

  private refreshHeader(result: SimulationResult) {
    const title = `第 ${this.level.index} 关 · ${this.level.name}`;
    if (this.levelTitleLabel) {
      this.levelTitleLabel.string = title;
    }

    if (this.progressLabel) {
      this.progressLabel.string = `${this.level.index}/${LevelPackV01.length}`;
    }

    if (result.success) {
      this.setHint('通关！光路已连通。');
      return;
    }

    this.setHint(this.level.hint);
  }

  private refreshToolbar() {
    this.toolbarView?.refresh(this.level.tools, this.countUsedTools(), this.selectedTool);
  }

  private onBoardTouchStart(pos: Vec2) {
    const hit = this.findPlacedObject(pos);
    if (hit) {
      this.selectedId = hit.id;
      if (hit.kind === 'mirror' && this.isNearMirrorHandle(hit, pos)) {
        this.dragMode = 'rotate';
      } else if (hit.movable) {
        this.dragMode = 'move';
        this.dragOffset = { x: hit.pos.x - pos.x, y: hit.pos.y - pos.y };
      }
      this.render();
      return;
    }

    this.selectedId = null;

    if (!this.selectedTool) {
      this.render();
      return;
    }

    if (!this.canPlaceTool(this.selectedTool)) {
      this.setHint(`${this.toolName(this.selectedTool)}数量已用尽`);
      this.render();
      return;
    }

    this.spawnTool(this.selectedTool, pos);
    if (!this.canPlaceTool(this.selectedTool)) {
      this.selectedTool = null;
    }
    this.render();
  }

  private onBoardTouchMove(pos: Vec2) {
    if (!this.selectedId || !this.dragMode) {
      return;
    }

    const target = this.placed.find((obj) => obj.id === this.selectedId);
    if (!target) {
      return;
    }

    if (this.dragMode === 'move') {
      target.pos = {
        x: pos.x + this.dragOffset.x,
        y: pos.y + this.dragOffset.y,
      };
      this.clampPlacedObject(target);
      this.render();
      return;
    }

    if (target.kind === 'mirror') {
      target.angleDeg = dirToAngleDeg({ x: pos.x - target.pos.x, y: pos.y - target.pos.y });
      this.render();
    }
  }

  private onBoardTouchEnd() {
    this.dragMode = null;
  }

  private spawnTool(kind: ToolKind, pos: Vec2) {
    this.idSeed += 1;
    const id = `${kind}-${this.level.id}-${this.idSeed}`;

    let created: PlacedObject;
    if (kind === 'mirror') {
      created = {
        id,
        kind,
        pos: { ...pos },
        angleDeg: -35,
        length: 86,
        movable: true,
      };
    } else if (kind === 'portableConcentrator') {
      created = {
        id,
        kind,
        pos: { ...pos },
        radius: 18,
        boostDistance: 260,
        movable: true,
      };
    } else {
      created = {
        id,
        kind,
        pos: { ...pos },
        radius: 18,
        angleDeg: 0,
        movable: true,
        enabled: true,
      };
    }

    this.clampPlacedObject(created);
    this.placed.push(created);
    this.selectedId = created.id;
    this.dragMode = null;
  }

  private clampPlacedObject(obj: PlacedObject) {
    const width = this.level.width;
    const height = this.level.height;

    let marginX = 14;
    let marginY = 14;

    if (obj.kind === 'mirror') {
      marginX = obj.length / 2 + 12;
      marginY = obj.length / 2 + 12;
    } else {
      marginX = obj.radius + 10;
      marginY = obj.radius + 10;
    }

    obj.pos = {
      x: clamp(obj.pos.x, marginX, width - marginX),
      y: clamp(obj.pos.y, marginY, height - marginY),
    };
  }

  private findPlacedObject(pos: Vec2): PlacedObject | null {
    for (let i = this.placed.length - 1; i >= 0; i -= 1) {
      const obj = this.placed[i];
      if (obj.kind === 'mirror') {
        const { a, b } = mirrorEndpoints(obj);
        const hitDist = this.distanceToSegment(pos, a, b);
        if (hitDist <= 24) {
          return obj;
        }
        continue;
      }

      if (dist(pos, obj.pos) <= obj.radius + 18) {
        return obj;
      }
    }

    return null;
  }

  private distanceToSegment(p: Vec2, a: Vec2, b: Vec2): number {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };

    const denom = Math.max(1e-6, ab.x * ab.x + ab.y * ab.y);
    const t = clamp((ap.x * ab.x + ap.y * ab.y) / denom, 0, 1);
    const q = { x: a.x + ab.x * t, y: a.y + ab.y * t };
    return dist(p, q);
  }

  private isNearMirrorHandle(mirror: MirrorObject, pos: Vec2): boolean {
    const dir = angleToDir(mirror.angleDeg);
    const handle = {
      x: mirror.pos.x + dir.x * (mirror.length / 2 + 22),
      y: mirror.pos.y + dir.y * (mirror.length / 2 + 22),
    };
    return dist(handle, pos) <= 22;
  }

  private countUsedTools(): ToolUsage {
    const used: ToolUsage = {
      mirror: 0,
      portableConcentrator: 0,
      prism: 0,
    };

    for (const obj of this.placed) {
      used[obj.kind] += 1;
    }

    return used;
  }

  private remainingToolCount(kind: ToolKind): number {
    const used = this.countUsedTools();
    return Math.max(0, this.level.tools[kind] - used[kind]);
  }

  private canPlaceTool(kind: ToolKind): boolean {
    return this.remainingToolCount(kind) > 0;
  }

  private setHint(message: string) {
    if (this.hintLabel) {
      this.hintLabel.string = message;
    }
  }

  private toolName(kind: ToolKind): string {
    if (kind === 'mirror') {
      return '镜子';
    }
    if (kind === 'portableConcentrator') {
      return '聚光器';
    }
    return '棱镜';
  }
}

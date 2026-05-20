import { _decorator, Component, Node, UITransform, view } from 'cc';
import { angleToDir, clamp, dirToAngle, dist, type Vec } from '../core/Math2D';
import { cloneLevel, moveObject, objectHitTest, simulateLight } from '../core/LightSimulator';
import type { Level, OpticalObject, SimulationResult, ToolKind } from '../core/LevelTypes';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, LevelPackWebParity } from '../levels/LevelPackWebParity';
import { RuntimeUI } from '../ui/RuntimeUI';
import { CanvasBoardRenderer } from '../views/CanvasBoardRenderer';

const { ccclass } = _decorator;

type DragState =
  | {
      mode: 'move';
      objectId: string;
      offset: Vec;
    }
  | {
      mode: 'rotate';
      objectId: string;
    }
  | null;

@ccclass('PrismGameController')
export class PrismGameController extends Component {
  private boardRenderer: CanvasBoardRenderer | null = null;
  private runtimeUI: RuntimeUI | null = null;

  private levelIndex = 0;
  private level: Level = cloneLevel(LevelPackWebParity[0]);
  private sim: SimulationResult = simulateLight(this.level);

  private selectedObjectId: string | null = null;
  private dragState: DragState = null;
  private activeTool: ToolKind | null = null;
  private idSeed = 0;

  onLoad() {
    this.bootstrapScene();
    this.boardRenderer?.setInputHandlers(
      this.onBoardTouchStart.bind(this),
      this.onBoardTouchMove.bind(this),
      this.onBoardTouchEnd.bind(this),
    );
    this.loadLevel(0);
  }

  start() {
    this.applyBoardScale();
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

  private bootstrapScene() {
    const rootTransform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    rootTransform.setContentSize(LOGICAL_WIDTH + 60, LOGICAL_HEIGHT + 260);

    const boardNode = this.ensureChild(this.node, 'BoardRoot');
    const boardTransform = boardNode.getComponent(UITransform) ?? boardNode.addComponent(UITransform);
    boardTransform.setContentSize(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.boardRenderer = boardNode.getComponent(CanvasBoardRenderer) ?? boardNode.addComponent(CanvasBoardRenderer);

    const uiRoot = this.ensureChild(this.node, 'UIRoot');
    const uiTransform = uiRoot.getComponent(UITransform) ?? uiRoot.addComponent(UITransform);
    uiTransform.setContentSize(LOGICAL_WIDTH + 60, LOGICAL_HEIGHT + 260);

    this.runtimeUI = uiRoot.getComponent(RuntimeUI) ?? uiRoot.addComponent(RuntimeUI);
    this.runtimeUI.build(LOGICAL_WIDTH, LOGICAL_HEIGHT, {
      onPrev: () => this.prevLevel(),
      onNext: () => this.nextLevel(),
      onReset: () => this.resetLevel(),
      onSelectTool: (tool) => this.toggleTool(tool),
      onRotateLeft: () => this.rotateSelectedBy(-5),
      onRotateRight: () => this.rotateSelectedBy(5),
      onVictoryNext: () => this.nextLevel(),
      onVictoryReset: () => this.resetLevel(),
    });
  }

  private applyBoardScale() {
    const visible = view.getVisibleSize();
    const maxW = Math.max(320, visible.width - 24);
    const maxH = Math.max(420, visible.height - 220);
    const scale = Math.min(maxW / LOGICAL_WIDTH, maxH / LOGICAL_HEIGHT);

    const boardNode = this.boardRenderer?.node;
    if (!boardNode) {
      return;
    }

    boardNode.setScale(scale, scale, 1);
    boardNode.setPosition(0, 0, 0);
  }

  private ensureChild(parent: Node, name: string): Node {
    const existing = parent.getChildByName(name);
    if (existing) {
      return existing;
    }

    const node = new Node(name);
    node.parent = parent;
    return node;
  }

  private loadLevel(index: number) {
    const total = LevelPackWebParity.length;
    if (total <= 0) {
      return;
    }

    this.levelIndex = ((index % total) + total) % total;
    this.level = cloneLevel(LevelPackWebParity[this.levelIndex]);
    this.selectedObjectId = null;
    this.dragState = null;
    this.activeTool = null;

    this.recalculate();
  }

  private recalculate() {
    this.sim = simulateLight(this.level);
    this.render();
  }

  private render() {
    this.boardRenderer?.render(
      this.level,
      {
        segments: this.sim.segments,
      },
      this.selectedObjectId,
    );

    this.runtimeUI?.setHeader(this.level.name, `${this.levelIndex + 1}/${LevelPackWebParity.length}`, this.statusText());
    this.runtimeUI?.setToolState(this.level.tools, this.activeTool);
    this.runtimeUI?.setRotateEnabled(this.isSelectedRotatable());

    if (this.sim.success) {
      this.runtimeUI?.showVictory('光路已连通，点击下一关继续');
    } else {
      this.runtimeUI?.hideVictory();
    }
  }

  private statusText(): string {
    if (this.sim.success) {
      return '光已抵达出口。';
    }

    if (this.sim.reason === 'blocked') {
      return '光路被障碍阻挡。';
    }

    if (this.sim.reason === 'distance_lost') {
      return '光程耗尽。';
    }

    return this.level.hint;
  }

  private toggleTool(tool: ToolKind) {
    const stock = this.level.tools[tool] ?? 0;
    if (stock <= 0) {
      return;
    }

    this.activeTool = this.activeTool === tool ? null : tool;
    this.selectedObjectId = null;
    this.dragState = null;
    this.render();
  }

  private rotateSelectedBy(delta: number) {
    if (!this.selectedObjectId) {
      return;
    }

    const object = this.level.objects.find((item) => item.id === this.selectedObjectId);
    if (!object || (object.kind !== 'mirror' && object.kind !== 'prism')) {
      return;
    }

    object.angleDeg = this.normalizeAngle(object.angleDeg + delta);
    this.recalculate();
  }

  private normalizeAngle(angle: number): number {
    let value = angle % 360;
    if (value <= -180) {
      value += 360;
    }
    if (value > 180) {
      value -= 360;
    }
    return value;
  }

  private onBoardTouchStart(pos: Vec) {
    const rotateTarget = this.findRotateHandle(pos);
    if (rotateTarget) {
      this.selectedObjectId = rotateTarget.id;
      this.dragState = { mode: 'rotate', objectId: rotateTarget.id };
      this.render();
      return;
    }

    const object = this.findTopObject(pos);
    if (object && 'movable' in object && object.movable) {
      this.selectedObjectId = object.id;
      this.dragState = {
        mode: 'move',
        objectId: object.id,
        offset: {
          x: object.pos.x - pos.x,
          y: object.pos.y - pos.y,
        },
      };
      this.activeTool = null;
      this.render();
      return;
    }

    if (this.activeTool) {
      this.spawnTool(this.activeTool, pos);
      this.activeTool = null;
      this.recalculate();
      return;
    }

    this.selectedObjectId = null;
    this.dragState = null;
    this.render();
  }

  private onBoardTouchMove(pos: Vec) {
    if (!this.dragState) {
      return;
    }

    const object = this.level.objects.find((item) => item.id === this.dragState?.objectId);
    if (!object) {
      return;
    }

    if (this.dragState.mode === 'move' && 'movable' in object && object.movable) {
      const nextPos = {
        x: pos.x + this.dragState.offset.x,
        y: pos.y + this.dragState.offset.y,
      };
      moveObject(object, nextPos);
      this.clampObjectInBounds(object);
      this.recalculate();
      return;
    }

    if (this.dragState.mode === 'rotate' && (object.kind === 'mirror' || object.kind === 'prism')) {
      object.angleDeg = dirToAngle({
        x: pos.x - object.pos.x,
        y: pos.y - object.pos.y,
      });
      this.recalculate();
    }
  }

  private onBoardTouchEnd() {
    this.dragState = null;
  }

  private spawnTool(tool: ToolKind, pos: Vec) {
    this.idSeed += 1;
    const id = `${tool}-${Date.now()}-${this.idSeed}`;

    if (tool === 'mirror' && this.level.tools.mirror > 0) {
      this.level.tools.mirror -= 1;
      const mirror: OpticalObject = {
        id,
        kind: 'mirror',
        pos: { ...pos },
        angleDeg: -35,
        length: 88,
        movable: true,
      };
      this.clampObjectInBounds(mirror);
      this.level.objects.push(mirror);
      this.selectedObjectId = id;
      return;
    }

    if (tool === 'portableConcentrator' && this.level.tools.portableConcentrator > 0) {
      this.level.tools.portableConcentrator -= 1;
      const concentrator: OpticalObject = {
        id,
        kind: 'concentrator',
        pos: { ...pos },
        radius: 23,
        boostDistance: 240,
        movable: true,
      };
      this.clampObjectInBounds(concentrator);
      this.level.objects.push(concentrator);
      this.selectedObjectId = id;
      return;
    }

    if (tool === 'prism' && this.level.tools.prism > 0) {
      this.level.tools.prism -= 1;
      const prism: OpticalObject = {
        id,
        kind: 'prism',
        pos: { ...pos },
        radius: 25,
        angleDeg: 0,
        movable: true,
      };
      this.clampObjectInBounds(prism);
      this.level.objects.push(prism);
      this.selectedObjectId = id;
    }
  }

  private findTopObject(pos: Vec): OpticalObject | null {
    for (let i = this.level.objects.length - 1; i >= 0; i -= 1) {
      const object = this.level.objects[i];
      if (objectHitTest(object, pos)) {
        return object;
      }
    }
    return null;
  }

  private findRotateHandle(pos: Vec): { id: string } | null {
    for (const object of this.level.objects) {
      if (object.kind === 'mirror') {
        const dir = angleToDir(object.angleDeg);
        const handle = {
          x: object.pos.x + dir.x * (object.length / 2 + 25),
          y: object.pos.y + dir.y * (object.length / 2 + 25),
        };
        if (dist(pos, handle) <= 17) {
          return { id: object.id };
        }
      }

      if (object.kind === 'prism') {
        const dir = angleToDir(object.angleDeg);
        const handle = {
          x: object.pos.x + dir.x * 42,
          y: object.pos.y + dir.y * 42,
        };
        if (dist(pos, handle) <= 17) {
          return { id: object.id };
        }
      }
    }

    return null;
  }

  private isSelectedRotatable(): boolean {
    if (!this.selectedObjectId) {
      return false;
    }

    const selected = this.level.objects.find((item) => item.id === this.selectedObjectId);
    return !!selected && (selected.kind === 'mirror' || selected.kind === 'prism');
  }

  private clampObjectInBounds(object: OpticalObject) {
    if (object.kind === 'obstacle') {
      return;
    }

    let marginX = 14;
    let marginY = 14;
    if (object.kind === 'mirror') {
      marginX = object.length / 2 + 12;
      marginY = object.length / 2 + 12;
    } else {
      marginX = object.radius + 10;
      marginY = object.radius + 10;
    }

    object.pos = {
      x: clamp(object.pos.x, marginX, LOGICAL_WIDTH - marginX),
      y: clamp(object.pos.y, marginY, LOGICAL_HEIGHT - marginY),
    };
  }
}

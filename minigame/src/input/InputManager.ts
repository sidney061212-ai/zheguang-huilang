import type { EntityId, Mirror, Vector2 } from "../entities/types";

export type TouchPhase = "start" | "move" | "end" | "cancel";

export type TouchEventPayload = {
  phase: TouchPhase;
  position: Vector2;
  screenPosition?: Vector2;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type InputCoordinateTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type MirrorInteractionMetrics = {
  mirrorHitPadding: number;
  rotationHandleDistance: number;
  rotationHandleRadius: number;
  dragStartThreshold: number;
  buttonPressSlop: number;
};

export const DEFAULT_MIRROR_INTERACTION_METRICS: MirrorInteractionMetrics = {
  mirrorHitPadding: 14,
  rotationHandleDistance: 42,
  rotationHandleRadius: 18,
  dragStartThreshold: 3,
  buttonPressSlop: 10
};

export type InputButtonTarget = {
  id: EntityId;
  bounds: Rect;
  enabled?: boolean;
  visible?: boolean;
  onClick?: () => void;
};

export type MirrorInteractionKind = "tap" | "drag" | "rotate";

export type InputAction =
  | {
      type: "mirror:select";
      mirrorId: EntityId;
      position: Vector2;
    }
  | {
      type: "mirror:drag-start";
      mirrorId: EntityId;
      position: Vector2;
      mirrorPosition: Vector2;
    }
  | {
      type: "mirror:drag";
      mirrorId: EntityId;
      position: Vector2;
      delta: Vector2;
      totalDelta: Vector2;
      nextPosition: Vector2;
    }
  | {
      type: "mirror:rotate-start";
      mirrorId: EntityId;
      position: Vector2;
      rotation: number;
    }
  | {
      type: "mirror:rotate";
      mirrorId: EntityId;
      position: Vector2;
      rotation: number;
      deltaRotation: number;
    }
  | {
      type: "mirror:release";
      mirrorId: EntityId;
      position: Vector2;
      interaction: MirrorInteractionKind;
    }
  | {
      type: "selection:clear";
      position: Vector2;
    }
  | {
      type: "button:press";
      buttonId: EntityId;
      position: Vector2;
    }
  | {
      type: "button:click";
      buttonId: EntityId;
      position: Vector2;
    };

type ActiveGesture =
  | {
      type: "drag";
      mirrorId: EntityId;
      startPosition: Vector2;
      lastPosition: Vector2;
      mirrorStartPosition: Vector2;
      hasMoved: boolean;
    }
  | {
      type: "rotate";
      mirrorId: EntityId;
      startPosition: Vector2;
      lastPosition: Vector2;
      center: Vector2;
      startAngle: number;
      startRotation: number;
      lastRotation: number;
      hasMoved: boolean;
    }
  | {
      type: "button";
      buttonId: EntityId;
      startPosition: Vector2;
    };

export class InputManager {
  private handlers = new Set<(payload: TouchEventPayload) => void>();
  private actionHandlers = new Set<(action: InputAction) => void>();
  private mirrors: Mirror[] = [];
  private buttons: InputButtonTarget[] = [];
  private selectedMirrorId: EntityId | null = null;
  private activeGesture: ActiveGesture | null = null;
  private coordinateTransform: InputCoordinateTransform | null = null;

  constructor(
    private readonly metrics: MirrorInteractionMetrics = DEFAULT_MIRROR_INTERACTION_METRICS
  ) {}

  onTouch(handler: (payload: TouchEventPayload) => void): void {
    this.handlers.add(handler);
  }

  offTouch(handler: (payload: TouchEventPayload) => void): void {
    this.handlers.delete(handler);
  }

  onAction(handler: (action: InputAction) => void): void {
    this.actionHandlers.add(handler);
  }

  offAction(handler: (action: InputAction) => void): void {
    this.actionHandlers.delete(handler);
  }

  setMirrors(mirrors: readonly Mirror[]): void {
    this.mirrors = [...mirrors];
    if (this.selectedMirrorId && !this.mirrors.some((mirror) => mirror.id === this.selectedMirrorId)) {
      this.selectedMirrorId = null;
    }
  }

  setButtons(buttons: readonly InputButtonTarget[]): void {
    this.buttons = [...buttons];
  }

  setCoordinateTransform(transform: InputCoordinateTransform | null): void {
    this.coordinateTransform = transform;
  }

  getSelectedMirrorId(): EntityId | null {
    return this.selectedMirrorId;
  }

  selectMirror(mirrorId: EntityId | null): void {
    this.selectedMirrorId = mirrorId;
  }

  emitTouch(payload: TouchEventPayload): void {
    const mappedPayload = this.mapTouchPayload(payload);
    for (const handler of this.handlers) {
      handler(mappedPayload);
    }
    this.handleTouch(mappedPayload);
  }

  hitTestMirror(point: Vector2): Mirror | null {
    for (let index = this.mirrors.length - 1; index >= 0; index -= 1) {
      const mirror = this.mirrors[index];
      if (!isInteractiveMirror(mirror)) continue;
      if (isPointOnMirrorBody(point, mirror, this.metrics.mirrorHitPadding)) {
        return mirror;
      }
    }
    return null;
  }

  hitTestRotationHandle(point: Vector2): Mirror | null {
    const selectedMirror = this.getSelectedMirror();
    if (selectedMirror && isInteractiveMirror(selectedMirror)) {
      const handlePosition = getMirrorRotationHandlePosition(selectedMirror, this.metrics);
      if (distance(point, handlePosition) <= this.metrics.rotationHandleRadius) {
        return selectedMirror;
      }
    }

    for (let index = this.mirrors.length - 1; index >= 0; index -= 1) {
      const mirror = this.mirrors[index];
      if (!isInteractiveMirror(mirror)) continue;
      const handlePosition = getMirrorRotationHandlePosition(mirror, this.metrics);
      if (distance(point, handlePosition) <= this.metrics.rotationHandleRadius) {
        return mirror;
      }
    }
    return null;
  }

  private handleTouch(payload: TouchEventPayload): void {
    switch (payload.phase) {
      case "start":
        this.handleStart(payload.position);
        break;
      case "move":
        this.handleMove(payload.position);
        break;
      case "end":
      case "cancel":
        this.handleEnd(payload.position, payload.phase === "cancel");
        break;
    }
  }

  private handleStart(position: Vector2): void {
    const button = this.hitTestButton(position);
    if (button) {
      this.activeGesture = { type: "button", buttonId: button.id, startPosition: position };
      this.emitAction({ type: "button:press", buttonId: button.id, position });
      return;
    }

    const rotationMirror = this.hitTestRotationHandle(position);
    if (rotationMirror) {
      this.setSelectedMirror(rotationMirror.id, position);
      const startAngle = angleBetween(rotationMirror.position, position);
      this.activeGesture = {
        type: "rotate",
        mirrorId: rotationMirror.id,
        startPosition: position,
        lastPosition: position,
        center: { ...rotationMirror.position },
        startAngle,
        startRotation: rotationMirror.rotation,
        lastRotation: rotationMirror.rotation,
        hasMoved: false
      };
      this.emitAction({
        type: "mirror:rotate-start",
        mirrorId: rotationMirror.id,
        position,
        rotation: rotationMirror.rotation
      });
      return;
    }

    const mirror = this.hitTestMirror(position);
    if (mirror) {
      this.setSelectedMirror(mirror.id, position);
      this.activeGesture = {
        type: "drag",
        mirrorId: mirror.id,
        startPosition: position,
        lastPosition: position,
        mirrorStartPosition: { ...mirror.position },
        hasMoved: false
      };
      this.emitAction({
        type: "mirror:drag-start",
        mirrorId: mirror.id,
        position,
        mirrorPosition: mirror.position
      });
      return;
    }

    if (this.selectedMirrorId) {
      this.selectedMirrorId = null;
      this.emitAction({ type: "selection:clear", position });
    }
    this.activeGesture = null;
  }

  private handleMove(position: Vector2): void {
    if (!this.activeGesture) return;

    if (this.activeGesture.type === "button") {
      return;
    }

    if (this.activeGesture.type === "drag") {
      const totalDelta = subtract(position, this.activeGesture.startPosition);
      const delta = subtract(position, this.activeGesture.lastPosition);
      const hasMoved =
        this.activeGesture.hasMoved || magnitude(totalDelta) >= this.metrics.dragStartThreshold;
      this.activeGesture = {
        ...this.activeGesture,
        lastPosition: position,
        hasMoved
      };
      if (!hasMoved) return;
      this.emitAction({
        type: "mirror:drag",
        mirrorId: this.activeGesture.mirrorId,
        position,
        delta,
        totalDelta,
        nextPosition: add(this.activeGesture.mirrorStartPosition, totalDelta)
      });
      return;
    }

    const angle = angleBetween(this.activeGesture.center, position);
    const deltaFromStart = normalizeRadians(angle - this.activeGesture.startAngle);
    const rotation = normalizeRadians(this.activeGesture.startRotation + deltaFromStart);
    const deltaRotation = normalizeRadians(rotation - this.activeGesture.lastRotation);
    const totalDelta = subtract(position, this.activeGesture.startPosition);
    const hasMoved =
      this.activeGesture.hasMoved || magnitude(totalDelta) >= this.metrics.dragStartThreshold;
    this.activeGesture = {
      ...this.activeGesture,
      lastPosition: position,
      lastRotation: rotation,
      hasMoved
    };
    if (!hasMoved) return;
    this.emitAction({
      type: "mirror:rotate",
      mirrorId: this.activeGesture.mirrorId,
      position,
      rotation,
      deltaRotation
    });
  }

  private handleEnd(position: Vector2, canceled: boolean): void {
    if (!this.activeGesture) return;

    if (this.activeGesture.type === "button") {
      const button = this.findButton(this.activeGesture.buttonId);
      const totalDelta = subtract(position, this.activeGesture.startPosition);
      if (!canceled && button && magnitude(totalDelta) <= this.metrics.buttonPressSlop && contains(button.bounds, position)) {
        button.onClick?.();
        this.emitAction({ type: "button:click", buttonId: button.id, position });
      }
      this.activeGesture = null;
      return;
    }

    this.emitAction({
      type: "mirror:release",
      mirrorId: this.activeGesture.mirrorId,
      position,
      interaction: this.activeGesture.hasMoved ? this.activeGesture.type : "tap"
    });
    this.activeGesture = null;
  }

  private setSelectedMirror(mirrorId: EntityId, position: Vector2): void {
    if (this.selectedMirrorId === mirrorId) return;
    this.selectedMirrorId = mirrorId;
    this.emitAction({ type: "mirror:select", mirrorId, position });
  }

  private getSelectedMirror(): Mirror | null {
    if (!this.selectedMirrorId) return null;
    return this.mirrors.find((mirror) => mirror.id === this.selectedMirrorId) ?? null;
  }

  private hitTestButton(point: Vector2): InputButtonTarget | null {
    for (let index = this.buttons.length - 1; index >= 0; index -= 1) {
      const button = this.buttons[index];
      if (button.visible === false || button.enabled === false) continue;
      if (contains(button.bounds, point)) return button;
    }
    return null;
  }

  private findButton(buttonId: EntityId): InputButtonTarget | null {
    return this.buttons.find((button) => button.id === buttonId) ?? null;
  }

  private emitAction(action: InputAction): void {
    for (const handler of this.actionHandlers) {
      handler(action);
    }
  }

  private mapTouchPayload(payload: TouchEventPayload): TouchEventPayload {
    if (!this.coordinateTransform) return payload;
    return {
      ...payload,
      screenPosition: payload.screenPosition ?? payload.position,
      position: toWorldPoint(payload.position, this.coordinateTransform)
    };
  }
}

export function getMirrorRotationHandlePosition(
  mirror: Pick<Mirror, "position" | "rotation">,
  metrics: Pick<MirrorInteractionMetrics, "rotationHandleDistance"> = DEFAULT_MIRROR_INTERACTION_METRICS
): Vector2 {
  const normal = {
    x: -Math.sin(mirror.rotation),
    y: Math.cos(mirror.rotation)
  };
  return {
    x: mirror.position.x + normal.x * metrics.rotationHandleDistance,
    y: mirror.position.y + normal.y * metrics.rotationHandleDistance
  };
}

export function isPointOnMirrorBody(
  point: Vector2,
  mirror: Pick<Mirror, "position" | "rotation" | "length">,
  padding: number = DEFAULT_MIRROR_INTERACTION_METRICS.mirrorHitPadding
): boolean {
  const dx = point.x - mirror.position.x;
  const dy = point.y - mirror.position.y;
  const cos = Math.cos(mirror.rotation);
  const sin = Math.sin(mirror.rotation);
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;
  return Math.abs(localX) <= mirror.length / 2 + padding && Math.abs(localY) <= padding;
}

function isInteractiveMirror(mirror: Mirror): boolean {
  return mirror.enabled && mirror.movable;
}

function toWorldPoint(point: Vector2, transform: InputCoordinateTransform): Vector2 {
  return {
    x: (point.x - transform.offsetX) / transform.scale,
    y: (point.y - transform.offsetY) / transform.scale
  };
}

function contains(rect: Rect, point: Vector2): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

function magnitude(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

function distance(a: Vector2, b: Vector2): number {
  return magnitude(subtract(a, b));
}

function angleBetween(from: Vector2, to: Vector2): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

function normalizeRadians(value: number): number {
  let angle = value;
  while (angle <= -Math.PI) angle += Math.PI * 2;
  while (angle > Math.PI) angle -= Math.PI * 2;
  return angle;
}

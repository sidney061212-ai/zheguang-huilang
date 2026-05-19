import type { Vector2 } from "../entities/types";

export type TouchPhase = "start" | "move" | "end" | "cancel";

export type TouchEventPayload = {
  phase: TouchPhase;
  position: Vector2;
};

export class InputManager {
  private handlers = new Set<(payload: TouchEventPayload) => void>();

  onTouch(handler: (payload: TouchEventPayload) => void): void {
    this.handlers.add(handler);
  }

  offTouch(handler: (payload: TouchEventPayload) => void): void {
    this.handlers.delete(handler);
  }

  emitTouch(payload: TouchEventPayload): void {
    for (const handler of this.handlers) {
      handler(payload);
    }
  }
}

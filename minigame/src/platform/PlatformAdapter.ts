import type { TouchEventPayload } from "../input/InputManager";

export type PlatformAdapter = {
  createCanvas(): HTMLCanvasElement;
  requestFrame(callback: FrameRequestCallback): number;
  cancelFrame(handle: number): void;
  onTouch(handler: (payload: TouchEventPayload) => void): void;
};

import type { TouchEventPayload } from "../input/InputManager";
import type { StorageAdapter } from "./StorageAdapter";

export type PlatformAdapter = {
  createCanvas(): HTMLCanvasElement;
  getViewportSize(): { width: number; height: number };
  createStorage(): StorageAdapter;
  requestFrame(callback: FrameRequestCallback): number;
  cancelFrame(handle: number): void;
  onTouch(handler: (payload: TouchEventPayload) => void): void;
};

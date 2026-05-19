import type { TouchEventPayload } from "../input/InputManager";
import type { PlatformAdapter } from "./PlatformAdapter";

type WechatCanvas = HTMLCanvasElement;

type WechatGlobal = {
  createCanvas?: () => WechatCanvas;
  onTouchStart?: (handler: (event: { touches: Array<{ clientX: number; clientY: number }> }) => void) => void;
  onTouchMove?: (handler: (event: { touches: Array<{ clientX: number; clientY: number }> }) => void) => void;
  onTouchEnd?: (handler: (event: { changedTouches: Array<{ clientX: number; clientY: number }> }) => void) => void;
};

declare const wx: WechatGlobal | undefined;

export class WechatPlatformAdapter implements PlatformAdapter {
  createCanvas(): HTMLCanvasElement {
    if (typeof wx !== "undefined" && wx.createCanvas) {
      return wx.createCanvas();
    }
    return document.createElement("canvas");
  }

  requestFrame(callback: FrameRequestCallback): number {
    return requestAnimationFrame(callback);
  }

  cancelFrame(handle: number): void {
    cancelAnimationFrame(handle);
  }

  onTouch(handler: (payload: TouchEventPayload) => void): void {
    if (typeof wx === "undefined") return;
    wx.onTouchStart?.((event) => {
      const touch = event.touches[0];
      if (!touch) return;
      handler({ phase: "start", position: { x: touch.clientX, y: touch.clientY } });
    });
    wx.onTouchMove?.((event) => {
      const touch = event.touches[0];
      if (!touch) return;
      handler({ phase: "move", position: { x: touch.clientX, y: touch.clientY } });
    });
    wx.onTouchEnd?.((event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      handler({ phase: "end", position: { x: touch.clientX, y: touch.clientY } });
    });
  }
}
